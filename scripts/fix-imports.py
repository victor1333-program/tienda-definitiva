#!/usr/bin/env python3
import os
import re

def fix_ui_imports(file_path):
    """Fix uppercase UI component imports to lowercase"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Dictionary of replacements
        replacements = {
            "from '@/components/ui/Card'": "from '@/components/ui/card'",
            "from '@/components/ui/Button'": "from '@/components/ui/button'",
            "from '@/components/ui/Badge'": "from '@/components/ui/badge'",
            "from '@/components/ui/Input'": "from '@/components/ui/input'",
            "from '@/components/ui/Select'": "from '@/components/ui/select'",
            "from '@/components/ui/Dialog'": "from '@/components/ui/dialog'",
            "from '@/components/ui/Alert'": "from '@/components/ui/alert'",
            "from '@/components/ui/Label'": "from '@/components/ui/label'",
            "from '@/components/ui/Tooltip'": "from '@/components/ui/tooltip'",
            "from '@/components/ui/Popover'": "from '@/components/ui/popover'",
            "from '@/components/ui/Table'": "from '@/components/ui/table'",
            "from '@/components/ui/Tabs'": "from '@/components/ui/tabs'",
            "from '@/components/ui/Toast'": "from '@/components/ui/toast'",
            "from '@/components/ui/Switch'": "from '@/components/ui/switch'",
            "from '@/components/ui/Progress'": "from '@/components/ui/progress'",
            "from '@/components/ui/Textarea'": "from '@/components/ui/textarea'",
            "from '@/components/ui/Separator'": "from '@/components/ui/separator'",
            "from '@/components/ui/Slider'": "from '@/components/ui/slider'",
        }
        
        # Apply replacements
        original_content = content
        for old, new in replacements.items():
            content = content.replace(old, new)
        
        # Only write if changes were made
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Fixed imports in: {file_path}")
            return True
        
        return False
        
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False

def main():
    """Fix UI imports in all TypeScript/JavaScript files"""
    fixed_count = 0
    
    for root, dirs, files in os.walk('src'):
        for file in files:
            if file.endswith(('.tsx', '.ts', '.jsx', '.js')):
                file_path = os.path.join(root, file)
                if fix_ui_imports(file_path):
                    fixed_count += 1
    
    print(f"\nFixed imports in {fixed_count} files")

if __name__ == "__main__":
    main()