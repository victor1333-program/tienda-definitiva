#!/usr/bin/env python3
import os
import re

def fix_all_ui_imports(file_path):
    """Fix all uppercase UI component imports to lowercase"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Dictionary of replacements (both single and double quotes)
        replacements = [
            # Button
            ("from '@/components/ui/Button'", "from '@/components/ui/button'"),
            ('from "@/components/ui/Button"', 'from "@/components/ui/button"'),
            # Card  
            ("from '@/components/ui/Card'", "from '@/components/ui/card'"),
            ('from "@/components/ui/Card"', 'from "@/components/ui/card"'),
            # Input
            ("from '@/components/ui/Input'", "from '@/components/ui/input'"),
            ('from "@/components/ui/Input"', 'from "@/components/ui/input"'),
            # Badge (should already be fixed, but just in case)
            ("from '@/components/ui/Badge'", "from '@/components/ui/badge'"),
            ('from "@/components/ui/Badge"', 'from "@/components/ui/badge"'),
            # Select
            ("from '@/components/ui/Select'", "from '@/components/ui/select'"),
            ('from "@/components/ui/Select"', 'from "@/components/ui/select"'),
            # Dialog
            ("from '@/components/ui/Dialog'", "from '@/components/ui/dialog'"),
            ('from "@/components/ui/Dialog"', 'from "@/components/ui/dialog"'),
            # Alert
            ("from '@/components/ui/Alert'", "from '@/components/ui/alert'"),
            ('from "@/components/ui/Alert"', 'from "@/components/ui/alert"'),
            # Label
            ("from '@/components/ui/Label'", "from '@/components/ui/label'"),
            ('from "@/components/ui/Label"', 'from "@/components/ui/label"'),
            # Tooltip
            ("from '@/components/ui/Tooltip'", "from '@/components/ui/tooltip'"),
            ('from "@/components/ui/Tooltip"', 'from "@/components/ui/tooltip"'),
            # Popover
            ("from '@/components/ui/Popover'", "from '@/components/ui/popover'"),
            ('from "@/components/ui/Popover"', 'from "@/components/ui/popover"'),
            # Table
            ("from '@/components/ui/Table'", "from '@/components/ui/table'"),
            ('from "@/components/ui/Table"', 'from "@/components/ui/table"'),
            # Tabs
            ("from '@/components/ui/Tabs'", "from '@/components/ui/tabs'"),
            ('from "@/components/ui/Tabs"', 'from "@/components/ui/tabs"'),
            # Toast
            ("from '@/components/ui/Toast'", "from '@/components/ui/toast'"),
            ('from "@/components/ui/Toast"', 'from "@/components/ui/toast"'),
            # Switch
            ("from '@/components/ui/Switch'", "from '@/components/ui/switch'"),
            ('from "@/components/ui/Switch"', 'from "@/components/ui/switch"'),
            # Progress
            ("from '@/components/ui/Progress'", "from '@/components/ui/progress'"),
            ('from "@/components/ui/Progress"', 'from "@/components/ui/progress"'),
            # Textarea
            ("from '@/components/ui/Textarea'", "from '@/components/ui/textarea'"),
            ('from "@/components/ui/Textarea"', 'from "@/components/ui/textarea"'),
            # Separator
            ("from '@/components/ui/Separator'", "from '@/components/ui/separator'"),
            ('from "@/components/ui/Separator"', 'from "@/components/ui/separator"'),
            # Slider
            ("from '@/components/ui/Slider'", "from '@/components/ui/slider'"),
            ('from "@/components/ui/Slider"', 'from "@/components/ui/slider"'),
            # Avatar
            ("from '@/components/ui/Avatar'", "from '@/components/ui/avatar'"),
            ('from "@/components/ui/Avatar"', 'from "@/components/ui/avatar"'),
        ]
        
        # Apply replacements
        original_content = content
        for old, new in replacements:
            content = content.replace(old, new)
        
        # Only write if changes were made
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Fixed UI imports in: {file_path}")
            return True
        
        return False
        
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False

def main():
    """Fix UI imports in all TypeScript/JavaScript files"""
    import subprocess
    
    # Find all files
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
            # Check if file contains any uppercase UI imports
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    # Check for any uppercase UI component import
                    if re.search(r'from ["\']@/components/ui/[A-Z]', content):
                        if fix_all_ui_imports(file_path):
                            fixed_count += 1
            except Exception as e:
                print(f"Error reading {file_path}: {e}")
    
    print(f"\nFixed UI imports in {fixed_count} files")

if __name__ == "__main__":
    main()