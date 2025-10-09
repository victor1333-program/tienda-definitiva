#!/usr/bin/env python3
import os
import re

def fix_badge_imports(file_path):
    """Fix Badge import to use lowercase"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Fix Badge import specifically (both single and double quotes)
        original_content = content
        content = content.replace("from '@/components/ui/Badge'", "from '@/components/ui/badge'")
        content = content.replace('from "@/components/ui/Badge"', 'from "@/components/ui/badge"')
        
        # Only write if changes were made
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Fixed Badge import in: {file_path}")
            return True
        
        return False
        
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False

def main():
    """Fix Badge imports in all files that have them"""
    import subprocess
    
    # Find all files with Badge imports
    result = subprocess.run([
        'find', 'src', '-name', '*.tsx', '-o', '-name', '*.ts'
    ], capture_output=True, text=True)
    
    if result.returncode != 0:
        print("Error finding files")
        return
    
    files = result.stdout.strip().split('\n')
    
    fixed_count = 0
    for file_path in files:
        if os.path.exists(file_path):
            # Check if file contains Badge import
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    if "@/components/ui/Badge'" in content or '@/components/ui/Badge"' in content:
                        if fix_badge_imports(file_path):
                            fixed_count += 1
            except Exception as e:
                print(f"Error reading {file_path}: {e}")
    
    print(f"\nFixed Badge imports in {fixed_count} files")

if __name__ == "__main__":
    main()