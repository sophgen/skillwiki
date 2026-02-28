---
name: python-basics-101
description: Teaches fundamental Python programming concepts including variables, data types, loops, functions, and data structures. Use when a user wants to learn Python from scratch, needs help with basic Python syntax, is preparing for coding interviews, or asks about beginner programming topics.
license: MIT
metadata:
  author: Jane Doe
  difficulty: beginner
  rating: "4.8"
  domain: education
  use-cases: "learn-programming, interview-preparation, build-python-foundations"
  featured: "true"
  tags: "python, programming, beginners, education"
---

# Python Basics 101

Learn the fundamentals of Python programming with hands-on examples.

## What You'll Learn

- Variables and data types
- Control flow (if/else, loops)
- Functions and scope
- Lists, dictionaries, and tuples
- File handling basics

## Getting Started

Follow these lessons in order to build your Python foundation.

### 1. Variables and Data Types

```python
# Variables store data
name = "Alice"
age = 25
height = 5.8
is_student = True

# Data types
print(type(name))      # <class 'str'>
print(type(age))       # <class 'int'>
print(type(height))    # <class 'float'>
print(type(is_student))  # <class 'bool'>
```

### 2. Loops

```python
# For loop
for i in range(5):
    print(f"Count: {i}")

# While loop
count = 0
while count < 5:
    print(f"Count: {count}")
    count += 1
```

### 3. Functions

```python
def greet(name):
    """Greet someone by name"""
    return f"Hello, {name}!"

print(greet("Alice"))
```

### 4. Data Structures

```python
# List
fruits = ["apple", "banana", "orange"]
fruits.append("grape")

# Dictionary
person = {"name": "Alice", "age": 25}
print(person["name"])

# Tuple (immutable)
coordinates = (10, 20)
```

## Practice Exercises

1. Write a program that calculates the factorial of a number
2. Create a function that reverses a string
3. Build a simple calculator with +, -, *, / operations

## Resources

- Official Python documentation: https://docs.python.org/
- Python tutorial for beginners
- Interactive Python playground
