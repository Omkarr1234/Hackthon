import asyncio
import os
import unittest
import uuid
from unittest.mock import patch

import httpx

from app.main import app


class ApiTests(unittest.TestCase):
    def request(self, method, path, **kwargs):
        async def make_request():
            async with httpx.AsyncClient(
                transport=httpx.ASGITransport(app=app),
                base_url="http://testserver",
            ) as client:
                return await client.request(method, path, **kwargs)

        return asyncio.run(make_request())

    def test_health_and_demo_login(self):
        health = self.request("GET", "/api/health")
        self.assertEqual(health.status_code, 200)
        self.assertEqual(health.json()["status"], "ok")

        demo = self.request("POST", "/api/auth/demo")
        self.assertEqual(demo.status_code, 200)
        self.assertTrue(demo.json()["demo"])
        self.assertTrue(demo.json()["token"])

    def test_registration_login_and_invalid_password(self):
        email = f"api-test-{uuid.uuid4().hex}@example.com"
        payload = {"name": "API Test Farmer", "email": email, "password": "correct-horse-battery"}

        registered = self.request("POST", "/api/auth/register", json=payload)
        self.assertEqual(registered.status_code, 200)
        self.assertTrue(registered.json()["token"])

        duplicate = self.request("POST", "/api/auth/register", json=payload)
        self.assertEqual(duplicate.status_code, 409)

        invalid = self.request(
            "POST",
            "/api/auth/login",
            json={**payload, "password": "wrong-password"},
        )
        self.assertEqual(invalid.status_code, 401)

        login = self.request("POST", "/api/auth/login", json=payload)
        self.assertEqual(login.status_code, 200)
        self.assertEqual(login.json()["user"]["email"], email)

    def test_chat_returns_json_without_provider_crash(self):
        response = self.request(
            "POST",
            "/api/chat",
            json={"crop_id": "tomato", "question": "How should I irrigate?", "lang": "en"},
        )
        self.assertIn(response.status_code, {200, 502, 503})
        self.assertIsInstance(response.json(), dict)
        if response.status_code == 200:
            self.assertTrue(response.json()["answer"])

    def test_chat_demo_mode_works_without_provider_key(self):
        with patch.dict(
            os.environ,
            {"GROQ_API_KEY": "", "FARMSENSE_DEMO_MODE": "true"},
            clear=False,
        ):
            response = self.request(
                "POST",
                "/api/chat",
                json={"crop_id": "tomato", "question": "How should I irrigate?", "lang": "en"},
            )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()["demo"])
        self.assertEqual(response.json()["model"], "demo-local")
        self.assertIn("sample", response.json()["answer"].lower())

    def test_plant_doctor_rejects_non_image_upload(self):
        response = self.request(
            "POST",
            "/api/plant/analyze",
            files={"image": ("notes.txt", b"not an image", "text/plain")},
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("image", response.json()["detail"].lower())

    def test_plant_doctor_missing_live_configuration_is_not_a_sample(self):
        with patch.dict(
            os.environ,
            {"GROQ_API_KEY": "", "GROQ_VISION_MODEL": "", "FARMSENSE_DEMO_MODE": "false"},
            clear=False,
        ):
            response = self.request(
                "POST",
                "/api/plant/analyze",
                files={"image": ("plant.png", b"\x89PNG\r\n", "image/png")},
            )
        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.json()["demo"])
        self.assertIn("configuration required", response.json()["condition"].lower())

    def test_mandi_without_key_is_explicitly_unavailable(self):
        if os.getenv("DATA_GOV_IN_API_KEY"):
            self.skipTest("Mandi provider is configured in this environment.")
        response = self.request("GET", "/api/mandi/prices?state=Karnataka")
        self.assertEqual(response.status_code, 503)
        self.assertIn("not configured", response.json()["detail"].lower())

    def test_public_demo_catalogues_have_records(self):
        for path, key in (
            ("/api/news", "items"),
            ("/api/products", "items"),
            ("/api/labour", "items"),
            ("/api/equipment", "items"),
        ):
            response = self.request("GET", path)
            self.assertEqual(response.status_code, 200, path)
            self.assertIsInstance(response.json()[key], list)

    def test_demo_shops_filter_by_location_and_category(self):
        response = self.request("GET", "/api/shops?q=Mysore+seed+shop&mode=demo")
        self.assertEqual(response.status_code, 200)
        results = response.json()["results"]
        self.assertTrue(results)
        self.assertTrue(all(item["is_demo"] for item in results))
        self.assertTrue(any("seed" in item["category"].lower() for item in results))


if __name__ == "__main__":
    unittest.main()
