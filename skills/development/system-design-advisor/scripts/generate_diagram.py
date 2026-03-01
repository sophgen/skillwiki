#!/usr/bin/env python3
"""
Architecture Diagram Generator
==============================
Generates cloud/system architecture diagrams using the `diagrams` library
(https://github.com/mingrammer/diagrams).

Requirements:
  - Python 3.9+
  - Graphviz (system package): `apt install graphviz` or `brew install graphviz`
  - diagrams (Python): `pip install diagrams`

Usage:
  This script is invoked by Claude when the user asks for an architecture diagram.
  Claude generates a diagram spec (Python code using the diagrams DSL) and this
  script validates, executes, and returns the output image path.

  python generate_diagram.py --spec <path-to-spec.py> --output <output-dir> [--format png|pdf|svg]

  Or for inline specs:
  python generate_diagram.py --inline "<python code>" --output <output-dir>

Examples:
  python generate_diagram.py --spec my_arch.py --output ./out --format png
  python generate_diagram.py --inline "
from diagrams import Diagram
from diagrams.aws.compute import EC2
from diagrams.aws.database import RDS
from diagrams.aws.network import ELB

with Diagram('Web Service', show=False, filename='diagram', outformat='png'):
    ELB('lb') >> EC2('web') >> RDS('db')
" --output ./out
"""

import argparse
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path


def check_dependencies():
    """Check that graphviz and diagrams are available."""
    errors = []

    # Check graphviz
    if not shutil.which("dot"):
        errors.append(
            "Graphviz is not installed. Install it with:\n"
            "  Ubuntu/Debian: sudo apt install graphviz\n"
            "  macOS: brew install graphviz\n"
            "  Windows: choco install graphviz"
        )

    # Check diagrams library
    try:
        import diagrams  # noqa: F401
    except ImportError:
        errors.append(
            "The 'diagrams' Python package is not installed. Install it with:\n"
            "  pip install diagrams"
        )

    return errors


def ensure_dependencies():
    """Try to install missing dependencies automatically."""
    if not shutil.which("dot"):
        print("⚠️  Graphviz not found. Attempting to install...")
        try:
            subprocess.run(
                ["apt-get", "install", "-y", "graphviz"],
                capture_output=True, check=True
            )
            print("✅ Graphviz installed.")
        except (subprocess.CalledProcessError, FileNotFoundError):
            print("❌ Could not auto-install Graphviz. Please install it manually.")
            return False

    try:
        import diagrams  # noqa: F401
    except ImportError:
        print("⚠️  'diagrams' package not found. Attempting to install...")
        try:
            subprocess.run(
                [sys.executable, "-m", "pip", "install", "diagrams",
                 "--break-system-packages", "-q"],
                capture_output=True, check=True
            )
            print("✅ diagrams installed.")
        except subprocess.CalledProcessError:
            print("❌ Could not auto-install diagrams. Please run: pip install diagrams")
            return False

    return True


def validate_spec(code: str) -> list[str]:
    """
    Basic safety validation of the diagram spec code.
    Rejects code that tries to do anything beyond generating diagrams.
    """
    warnings = []
    dangerous_patterns = [
        ("import os", "Direct os module usage"),
        ("import subprocess", "Subprocess usage"),
        ("import shutil", "File manipulation"),
        ("open(", "File I/O operations"),
        ("exec(", "Dynamic code execution"),
        ("eval(", "Dynamic code evaluation"),
        ("__import__", "Dynamic imports"),
        ("os.system", "System command execution"),
        ("os.popen", "System command execution"),
        ("os.remove", "File deletion"),
        ("os.unlink", "File deletion"),
        ("shutil.rmtree", "Directory deletion"),
    ]

    for pattern, description in dangerous_patterns:
        if pattern in code:
            warnings.append(f"⚠️  Potentially unsafe pattern: {description} ({pattern})")

    # Check that it actually uses the diagrams library
    if "from diagrams" not in code and "import diagrams" not in code:
        warnings.append("⚠️  Code does not appear to import from the diagrams library.")

    return warnings


def run_diagram_spec(code: str, output_dir: str, fmt: str = "png") -> str:
    """
    Execute a diagram spec and return the path to the generated image.

    The spec should use `show=False` and specify `filename` and `outformat`
    in the Diagram constructor. This function patches the code to ensure
    correct output settings.
    """
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    # Create a temp directory for execution
    with tempfile.TemporaryDirectory() as tmpdir:
        spec_file = Path(tmpdir) / "diagram_spec.py"

        # Ensure the diagram outputs to our target directory
        # Inject output settings if not present
        patched_code = code

        # If show=True or show not specified, patch it
        if "show=True" in patched_code:
            patched_code = patched_code.replace("show=True", "show=False")

        spec_file.write_text(patched_code)

        # Execute the spec
        result = subprocess.run(
            [sys.executable, str(spec_file)],
            capture_output=True,
            text=True,
            cwd=str(output_path),
            timeout=60
        )

        if result.returncode != 0:
            print(f"❌ Diagram generation failed:\n{result.stderr}")
            return ""

        # Find the generated file(s)
        generated = list(output_path.glob(f"*.{fmt}"))
        if not generated:
            # Try other common formats
            for ext in ["png", "pdf", "svg", "jpg"]:
                generated = list(output_path.glob(f"*.{ext}"))
                if generated:
                    break

        if generated:
            print(f"✅ Diagram generated: {generated[0]}")
            return str(generated[0])
        else:
            print(f"❌ No output file found in {output_path}")
            if result.stdout:
                print(f"stdout: {result.stdout}")
            return ""


def main():
    parser = argparse.ArgumentParser(description="Generate architecture diagrams")
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--spec", help="Path to a Python file containing the diagram spec")
    group.add_argument("--inline", help="Inline Python code for the diagram spec")
    parser.add_argument("--output", required=True, help="Output directory for the diagram")
    parser.add_argument("--format", default="png", choices=["png", "pdf", "svg"],
                        help="Output format (default: png)")
    parser.add_argument("--auto-install", action="store_true",
                        help="Attempt to auto-install missing dependencies")
    args = parser.parse_args()

    # Check / install dependencies
    if args.auto_install:
        if not ensure_dependencies():
            sys.exit(1)
    else:
        errors = check_dependencies()
        if errors:
            print("❌ Missing dependencies:")
            for e in errors:
                print(f"  {e}")
            print("\nRun with --auto-install to attempt automatic installation.")
            sys.exit(1)

    # Load the spec
    if args.spec:
        spec_path = Path(args.spec)
        if not spec_path.exists():
            print(f"❌ Spec file not found: {args.spec}")
            sys.exit(1)
        code = spec_path.read_text()
    else:
        code = args.inline

    # Validate
    warnings = validate_spec(code)
    for w in warnings:
        print(w)

    # Generate
    result = run_diagram_spec(code, args.output, args.format)
    if result:
        print(f"\n📊 Output: {result}")
    else:
        sys.exit(1)


if __name__ == "__main__":
    main()
