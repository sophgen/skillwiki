---
name: slack-gif-creator
description: Knowledge and utilities for creating animated GIFs optimized for Slack. Provides constraints, validation tools, and animation concepts. Use when users request animated GIFs for Slack like "make me a GIF of X doing Y for Slack."
license: Complete terms in LICENSE.txt
metadata:
  author: Anthropic
  difficulty: beginner
  rating: "4.2"
  domain: workflow
  use-cases: "slack-emoji-creation, animated-gif-creation, gif-optimization, slack-messaging"
  featured: "false"
  tags: "slack, gif, animation, emoji, pillow, python"
---

# Slack GIF Creator

A toolkit providing utilities and knowledge for creating animated GIFs optimized for Slack.

## Slack Requirements

**Dimensions:**
- Emoji GIFs: 128x128 (recommended)
- Message GIFs: 480x480

**Parameters:**
- FPS: 10-30 (lower is smaller file size)
- Colors: 48-128 (fewer = smaller file size)
- Duration: Keep under 3 seconds for emoji GIFs

## Core Workflow

```python
from core.gif_builder import GIFBuilder
from PIL import Image, ImageDraw

# 1. Create builder
builder = GIFBuilder(width=128, height=128, fps=10)

# 2. Generate frames
for i in range(12):
    frame = Image.new('RGB', (128, 128), (240, 248, 255))
    draw = ImageDraw.Draw(frame)
    # Draw your animation using PIL primitives
    builder.add_frame(frame)

# 3. Save with optimization
builder.save('output.gif', num_colors=48, optimize_for_emoji=True)
```

## Drawing Graphics

### Working with User-Uploaded Images
If a user uploads an image:
- **Use it directly** (e.g., "animate this", "split this into frames")
- **Use it as inspiration** (e.g., "make something like this")

```python
from PIL import Image
uploaded = Image.open('file.png')
```

### Drawing from Scratch
```python
from PIL import ImageDraw

draw = ImageDraw.Draw(frame)

# Circles/ovals
draw.ellipse([x1, y1, x2, y2], fill=(r, g, b), outline=(r, g, b), width=3)

# Stars, triangles, any polygon
points = [(x1, y1), (x2, y2), (x3, y3)]
draw.polygon(points, fill=(r, g, b))

# Lines
draw.line([(x1, y1), (x2, y2)], fill=(r, g, b), width=5)

# Rectangles
draw.rectangle([x1, y1, x2, y2], fill=(r, g, b), outline=(r, g, b), width=3)
```

### Making Graphics Look Good

- **Use thicker lines** - Always set `width=2` or higher for outlines. Thin lines look "choppy and amateurish."
- **Add visual depth** - Use gradients for backgrounds, layer multiple shapes for complexity
- **Pay attention to colors** - Use vibrant, complementary colors, add contrast

## Available Utilities

### GIFBuilder (`core.gif_builder`)
```python
builder = GIFBuilder(width=128, height=128, fps=10)
builder.add_frame(frame)       # Add PIL Image
builder.add_frames(frames)     # Add list of frames
builder.save('out.gif', num_colors=48, optimize_for_emoji=True, remove_duplicates=True)
```

### Validators (`core.validators`)
```python
from core.validators import validate_gif, is_slack_ready

passes, info = validate_gif('my.gif', is_emoji=True, verbose=True)

if is_slack_ready('my.gif'):
    print("Ready!")
```

### Easing Functions (`core.easing`)
```python
from core.easing import interpolate

t = i / (num_frames - 1)
y = interpolate(start=0, end=400, t=t, easing='ease_out')
# Available: linear, ease_in, ease_out, ease_in_out, bounce_out, elastic_out, back_out
```

### Frame Helpers (`core.frame_composer`)
```python
from core.frame_composer import (
    create_blank_frame,
    create_gradient_background,
    draw_circle,
    draw_text,
    draw_star
)
```

## Animation Concepts

### Shake/Vibrate - Use `math.sin()` with frame index
### Pulse/Heartbeat - Use `math.sin(t * frequency * 2 * math.pi)` for smooth pulse
### Bounce - Use `interpolate()` with `easing='bounce_out'` for landing
### Spin/Rotate - PIL: `image.rotate(angle, resample=Image.BICUBIC)`
### Fade In/Out - Adjust alpha channel, or `Image.blend(image1, image2, alpha)`
### Slide - Use `interpolate()` with `easing='ease_out'` for smooth stop
### Explode/Particle Burst - Generate particles with random angles and velocities

## Optimization Strategies

Only when asked to make the file size smaller:

```python
# Maximum optimization for emoji
builder.save(
    'emoji.gif',
    num_colors=48,
    optimize_for_emoji=True,
    remove_duplicates=True
)
```

1. **Fewer frames** - Lower FPS (10 instead of 20) or shorter duration
2. **Fewer colors** - `num_colors=48` instead of 128
3. **Smaller dimensions** - 128x128 instead of 480x480
4. **Remove duplicates** - `remove_duplicates=True` in save()

## Dependencies

```bash
pip install pillow imageio numpy
```

> **Source**: This skill is sourced from [anthropics/skills](https://github.com/anthropics/skills/tree/main/skills/slack-gif-creator) on GitHub. Core utilities (`core/` directory) are bundled in the full skill download.
