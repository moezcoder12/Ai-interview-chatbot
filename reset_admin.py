from database import SessionLocal
import models
from security import hash_password

db = SessionLocal()

# Email jiska password reset karna hai
admin_email = "admin@gmail.com"  # Apna admin email yahan likhein
new_password = "adminadmin"  # Apna naya password yahan likhein

user = db.query(models.User).filter(models.User.email == admin_email).first()

if user:
    # Existing Admin Ka Password Reset
    user.password = hash_password(new_password)
    user.role = "admin"
    db.commit()
    print(f"Password for {admin_email} successfully updated!")
else:
    # Agar Admin nahi milta toh Naya Admin Create karein
    new_admin = models.User(
        name="admin",
        email=admin_email,
        password=hash_password(new_password),
        role="admin"
    )
    db.add(new_admin)
    db.commit()
    print(f"New Admin account created: {admin_email}")

db.close()