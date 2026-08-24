import tkinter as tk
from tkinter import messagebox

# Function to check login
def login():
    username = entry_user.get()
    password = entry_pass.get()

    if username == "admin" and password == "1234":
        messagebox.showinfo("Login", "Login Successful!")
    else:
        messagebox.showerror("Login", "Invalid Credentials")

# Create window
root = tk.Tk()
root.title("Login Form")
root.geometry("300x200")

# Labels
tk.Label(root, text="Username").pack()
entry_user = tk.Entry(root)
entry_user.pack()

tk.Label(root, text="Password").pack()
entry_pass = tk.Entry(root, show="*")
entry_pass.pack()

# Button
tk.Button(root, text="Login", command=login).pack()

# Run app
root.mainloop()