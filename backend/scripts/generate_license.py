#!/usr/bin/env python3
"""
Offline license key generator for SkillMark Portable.

Usage:
    python scripts/generate_license.py --sub "Acme Corp" --tier pro --seats 50 --days 365

The signing secret is taken from APP_SECRET_KEY in .env (or the env var directly).
"""

import argparse
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
load_dotenv()

from app.services.license import generate_license, validate_license


def main():
    parser = argparse.ArgumentParser(description="Generate a SkillMark license key")
    parser.add_argument("--sub", required=True, help="Organization / customer identifier")
    parser.add_argument("--tier", default="pro", choices=["trial", "pro", "enterprise"])
    parser.add_argument("--seats", type=int, default=0, help="Max seats (0 = unlimited)")
    parser.add_argument("--days", type=int, default=365, help="Validity in days")
    args = parser.parse_args()

    key = generate_license(sub=args.sub, tier=args.tier, seats=args.seats, days=args.days)
    print(f"\nLicense key:\n{key}\n")

    # sanity check
    info = validate_license(key)
    print(f"  mode    : {info['mode']}")
    print(f"  tier    : {info['tier']}")
    print(f"  seats   : {info['seats'] or 'unlimited'}")
    print(f"  expires : {info['expires_at']}")
    print(f"  valid   : {info['valid']}\n")
    print("Set SKILLMARK_LICENSE_KEY in .env to activate.")


if __name__ == "__main__":
    main()
