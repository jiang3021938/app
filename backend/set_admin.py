#!/usr/bin/env python3
"""
管理员设置脚本
用于将指定用户设置为管理员，管理员可以无限测试（不消耗积分）
"""

import sqlite3
import sys

def list_users():
    """列出所有用户"""
    conn = sqlite3.connect('app.db')
    cursor = conn.cursor()
    cursor.execute("SELECT id, email, role FROM users")
    users = cursor.fetchall()
    conn.close()
    return users

def set_admin_by_email(email: str):
    """通过邮箱设置管理员"""
    conn = sqlite3.connect('app.db')
    cursor = conn.cursor()
    
    # 查找用户
    cursor.execute("SELECT id, email, role FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()
    
    if not user:
        print(f"❌ 未找到邮箱为 {email} 的用户")
        print("请先登录系统创建账户，然后再运行此脚本")
        conn.close()
        return False
    
    # 更新为管理员
    cursor.execute("UPDATE users SET role = 'admin' WHERE email = ?", (email,))
    conn.commit()
    
    print(f"✅ 已将用户 {email} 设置为管理员")
    print(f"   用户ID: {user[0]}")
    print(f"   原角色: {user[2]} -> 新角色: admin")
    
    conn.close()
    return True

def set_admin_by_id(user_id: str):
    """通过用户ID设置管理员"""
    conn = sqlite3.connect('app.db')
    cursor = conn.cursor()
    
    # 查找用户
    cursor.execute("SELECT id, email, role FROM users WHERE id = ?", (user_id,))
    user = cursor.fetchone()
    
    if not user:
        print(f"❌ 未找到ID为 {user_id} 的用户")
        conn.close()
        return False
    
    # 更新为管理员
    cursor.execute("UPDATE users SET role = 'admin' WHERE id = ?", (user_id,))
    conn.commit()
    
    print(f"✅ 已将用户设置为管理员")
    print(f"   用户ID: {user[0]}")
    print(f"   邮箱: {user[1]}")
    print(f"   原角色: {user[2]} -> 新角色: admin")
    
    conn.close()
    return True

def main():
    print("=" * 50)
    print("LeaseLens 管理员设置工具")
    print("=" * 50)
    
    # 列出现有用户
    users = list_users()
    
    if not users:
        print("\n⚠️  数据库中没有用户")
        print("请先通过网页登录系统创建账户，然后再运行此脚本")
        return
    
    print(f"\n📋 现有用户列表 ({len(users)} 个):")
    print("-" * 50)
    for i, (uid, email, role) in enumerate(users, 1):
        admin_mark = " 👑" if role == "admin" else ""
        print(f"  {i}. {email} (角色: {role}){admin_mark}")
    print("-" * 50)
    
    if len(sys.argv) > 1:
        # 命令行参数模式
        email_or_id = sys.argv[1]
        if "@" in email_or_id:
            set_admin_by_email(email_or_id)
        else:
            set_admin_by_id(email_or_id)
    else:
        # 交互模式
        print("\n请输入要设置为管理员的用户邮箱或序号:")
        choice = input("> ").strip()
        
        if choice.isdigit():
            idx = int(choice) - 1
            if 0 <= idx < len(users):
                set_admin_by_id(users[idx][0])
            else:
                print("❌ 无效的序号")
        elif "@" in choice:
            set_admin_by_email(choice)
        else:
            set_admin_by_id(choice)

if __name__ == "__main__":
    main()
