#!/usr/bin/env python3
"""
Script para corregir problemas de linting automáticamente
"""

import os
import re
import glob

def fix_unused_vars(file_path):
    """Remove unused variable declarations"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove unused variables that are assigned but never used
    patterns = [
        r"const (\w+) = .*?;\s*(?=\n)",  # unused const assignments
        r"let (\w+) = .*?;\s*(?=\n)",     # unused let assignments
    ]
    
    for pattern in patterns:
        content = re.sub(pattern, "", content, flags=re.MULTILINE)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

def fix_unused_imports(file_path):
    """Remove commonly unused imports"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove unused React import in client components
    if "'use client'" in content or '"use client"' in content:
        content = re.sub(r"import React from ['\"]react['\"];\n", "", content)
    
    # Remove empty import lines
    content = re.sub(r"import \{\s*\} from .*?;\n", "", content)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

def fix_escape_quotes(file_path):
    """Fix unescaped quotes in JSX"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace " with &quot; in JSX text content
    content = re.sub(r'([>][^<]*)"([^<]*[<])', r'\1&quot;\2', content)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

def main():
    # Get all TypeScript and JavaScript files
    file_patterns = ['src/**/*.ts', 'src/**/*.tsx', 'src/**/*.js', 'src/**/*.jsx']
    
    all_files = []
    for pattern in file_patterns:
        all_files.extend(glob.glob(pattern, recursive=True))
    
    print(f"Found {len(all_files)} files to process...")
    
    for file_path in all_files:
        print(f"Processing: {file_path}")
        try:
            fix_unused_imports(file_path)
            fix_unused_vars(file_path)
            if file_path.endswith(('.tsx', '.jsx')):
                fix_escape_quotes(file_path)
        except Exception as e:
            print(f"Error processing {file_path}: {e}")
    
    print("✅ Lint fixes completed!")

if __name__ == "__main__":
    main()