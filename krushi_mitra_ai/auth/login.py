import streamlit as st

from krushi_mitra_ai.auth.security import verify_password
from krushi_mitra_ai.database.database import get_user_by_user_id


def render_login_page() -> None:
    st.markdown("""
    <div class='auth-wrap'>
      <h1>🌱 Krushi Mitra AI</h1>
      <p>AI-Powered Smart Agriculture Assistant</p>
    </div>
    """, unsafe_allow_html=True)

    with st.container(border=True):
        user_id = st.text_input("User ID")
        password = st.text_input("Password", type="password")

        if st.button("🚜 Login", type="primary", use_container_width=True):
            user = get_user_by_user_id(user_id.strip())
            if not user or not verify_password(password, user["password_hash"]):
                st.error("Invalid User ID or password.")
            else:
                st.session_state.current_user_id = user["user_id"]
                st.session_state.current_language = user["language"]
                st.session_state.route = "dashboard"
                st.rerun()

        cols = st.columns(2)
        if cols[0].button("🔐 Forgot Password?", use_container_width=True):
            st.session_state.route = "forgot"
            st.rerun()
        if cols[1].button("📝 Create New Account", use_container_width=True):
            st.session_state.route = "register"
            st.rerun()
