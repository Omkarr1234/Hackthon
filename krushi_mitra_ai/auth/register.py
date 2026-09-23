import re
from pathlib import Path

import streamlit as st
from PIL import Image

from krushi_mitra_ai.auth.security import generate_auto_user_id, hash_password, password_strength_error
from krushi_mitra_ai.config import LANGUAGE_OPTIONS
from krushi_mitra_ai.database.database import (
    create_user,
    get_user_by_email,
    get_user_by_phone,
    get_user_by_user_id,
    now_iso,
    save_profile_photo,
)

PHONE_RE = re.compile(r"^\+?\d{10,15}$")
EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def _validate_registration(full_name: str, phone: str, email: str, password: str, confirm_password: str, user_id: str) -> str | None:
    if not full_name.strip():
        return "Name cannot be empty."
    if not PHONE_RE.match(phone.strip()):
        return "Enter a valid phone number (10-15 digits, optional +)."
    if not EMAIL_RE.match(email.strip()):
        return "Enter a valid email address."
    error = password_strength_error(password)
    if error:
        return error
    if password != confirm_password:
        return "Passwords do not match."
    if get_user_by_user_id(user_id):
        return "User ID already exists. Choose another ID."
    if get_user_by_phone(phone.strip()):
        return "Phone number already registered."
    if get_user_by_email(email.strip()):
        return "Email already registered."
    return None


def render_register_page() -> None:
    st.title("🌱 Create Your Farmer Account")
    if st.button("⬅️ Back to Login"):
        st.session_state.route = "login"
        st.rerun()

    with st.form("register_form"):
        full_name = st.text_input("Full Name")
        photo = st.file_uploader("Upload Profile Photo", type=["jpg", "jpeg", "png", "webp"])
        phone = st.text_input("Phone Number")
        email = st.text_input("Email Address")

        user_id_option = st.radio("User ID option", ["Create my own User ID", "Generate User ID automatically"], horizontal=True)
        custom_user_id = st.text_input("Choose User ID", disabled=user_id_option != "Create my own User ID")

        language_group = st.radio("AI Assistant Language", ["🇬🇧 English", "🌾 Local Language"], horizontal=True)
        local_language = st.selectbox("Select Indian language", LANGUAGE_OPTIONS[1:], disabled=language_group != "🌾 Local Language")
        selected_language = "English" if language_group == "🇬🇧 English" else local_language

        password = st.text_input("Password", type="password")
        confirm_password = st.text_input("Confirm Password", type="password")

        submitted = st.form_submit_button("✅ Register")

    if not submitted:
        return

    try:
        chosen_user_id = custom_user_id.strip() if user_id_option == "Create my own User ID" else generate_auto_user_id(full_name, get_user_by_user_id)
    except ValueError as exc:
        st.error(str(exc))
        return

    error = _validate_registration(full_name, phone, email, password, confirm_password, chosen_user_id)
    if error:
        st.error(error)
        return

    photo_path = None
    if photo:
        try:
            image = Image.open(photo)
            st.image(image, caption="Profile Preview", width=140)
            extension = Path(photo.name).suffix.lower() or ".png"
            photo_path = save_profile_photo(chosen_user_id, photo.getvalue(), extension)
        except Exception:
            st.warning("Profile image could not be processed. Default avatar will be used.")

    create_user(
        {
            "user_id": chosen_user_id,
            "full_name": full_name.strip(),
            "phone": phone.strip(),
            "email": email.strip().lower(),
            "password_hash": hash_password(password),
            "language": selected_language,
            "profile_photo_path": photo_path,
            "created_at": now_iso(),
        }
    )

    st.success(f"✅ Registration successful! Your Krushi Mitra AI User ID is: {chosen_user_id}")
    st.info("Please save your User ID. You need it to log in.")
    st.session_state.route = "login"
    st.rerun()
