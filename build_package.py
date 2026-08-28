#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
GX Speed Dial Pro - Build Script
================================
Kök klasördeki (yerel/geliştirme) sürümü otomatik olarak iki çıktıya dönüştürür:
"package" ve "opera".

Yaptıkları:
  1. Uzantı dosyalarını kökten package klasörüne kopyalar.
  2. package/ manifest.json'una "chrome_url_overrides.newtab" bloğunu ekler.
     - Bu, Chrome, Edge ve diğer uyumlu Chromium tarayıcılarda yeni sekme
       sayfasının doğrudan değiştirilmesini sağlar.
  3. Sürüm numarasını otomatik artırır (örn. 3.2 -> 3.3) hem kök hem package
     manifest'ine uygular. (Mağazaya her yükleyişte sürüm benzersiz olmalı.)
  4. Opera chrome_url_overrides.newtab desteklemediği için, bu ayar olmadan
     kök dizinin bir kopyasını opera klasöründe oluşturur. README, New Metin
     Belgesi, build_package.py, package ve opera bu kopyaya alınmaz.

Kullanım:
    python build_package.py            # normal sürüm artırımı ile derle
    python build_package.py --no-bump  # sürümü artırmadan sadece kopyala

Gereksinim: Python 3.6+ (ek paket gerekmez, yalnızca standart kütüphane).
"""

import json
import os
import shutil
import sys

# Windows konsolunda Türkçe karakterleri stdout'a yazarken (cp1252) hata vermemesi
# için konsol çıktısını UTF-8'e zorla.
try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

# --- Ayarlar ----------------------------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))          # betiğin bulunduğu kök
PACKAGE_DIR = os.path.join(BASE_DIR, "package")
OPERA_DIR = os.path.join(BASE_DIR, "opera")
MANIFEST_NAME = "manifest.json"

# Package'a kopyalanacak dosyalar (kök klasörde bulunanlar)
COPY_FILES = [
    "manifest.json",
    "background.js",
    "newtab.html",
    "newtab.js",
    "style.css",
    "icon.png",
]

# opera çıktısına alınmayacak kök dizin öğeleri
OPERA_EXCLUDE = {
    "README.md",
    "New Metin Belgesi.txt",
    "build_package.py",
    "package",
    "opera",
}


def bump_version(version):
    """Sürümün son segmentini 1 artırır: '3.2' -> '3.3', '1.0.9' -> '1.0.10'."""
    parts = version.split(".")
    try:
        parts[-1] = str(int(parts[-1]) + 1)
    except ValueError:
        # Son segment sayı değilse (örn. '3.2-beta') sona '.1' ekle
        parts.append("1")
    return ".".join(parts)


def load_json(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def save_json(path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")


def create_opera_copy():
    """Kökü, belirtilen öğeler hariç opera klasörüne bire bir kopyalar."""
    if os.path.isdir(OPERA_DIR):
        shutil.rmtree(OPERA_DIR)

    os.makedirs(OPERA_DIR)
    for name in os.listdir(BASE_DIR):
        if name in OPERA_EXCLUDE:
            continue

        src = os.path.join(BASE_DIR, name)
        dst = os.path.join(OPERA_DIR, name)
        if os.path.isdir(src):
            shutil.copytree(src, dst)
        else:
            shutil.copy2(src, dst)


def main():
    do_bump = "--no-bump" not in sys.argv

    if not os.path.isfile(os.path.join(BASE_DIR, MANIFEST_NAME)):
        print(f"[HATA] {MANIFEST_NAME} kök klasörde bulunamadı: {BASE_DIR}")
        sys.exit(1)

    # --- 1) Kök manifesti oku ---
    root_manifest = load_json(os.path.join(BASE_DIR, MANIFEST_NAME))
    version = root_manifest.get("version", "1.0")

    if do_bump:
        new_version = bump_version(version)
        print(f"Sürüm: {version} -> {new_version}")
        root_manifest["version"] = new_version
    else:
        new_version = version
        print(f"Sürüm değiştirilmedi (--no-bump): {version}")

    # --- 2) chrome_url_overrides ekle (paketlenmiş sürüm için) ---
    if "chrome_url_overrides" not in root_manifest:
        root_manifest["chrome_url_overrides"] = {"newtab": "newtab.html"}
        print("chrome_url_overrides.newtab -> newtab.html  eklendi")
    else:
        print("chrome_url_overrides zaten mevcut, aynen korundu")

    # --- 3) Package klasörünü hazırla & dosyaları kopyala ---
    os.makedirs(PACKAGE_DIR, exist_ok=True)
    for fname in COPY_FILES:
        src = os.path.join(BASE_DIR, fname)
        dst = os.path.join(PACKAGE_DIR, fname)
        if os.path.isfile(src):
            shutil.copy2(src, dst)
            print(f"  kopyalandi: {fname}")
        else:
            print(f"  [UYARI] atlandi (yok): {fname}")

    # --- 4) package manifest.json'u yaz ---
    save_json(os.path.join(PACKAGE_DIR, MANIFEST_NAME), root_manifest)

    # --- 5) Kök manifest'i güncel sürümle geri yaz (sürüm senkron) ---
    #     (chrome_url_overrides köke YAZILMAZ — yerel sürüm onsuz kalmalı)
    root_back = load_json(os.path.join(BASE_DIR, MANIFEST_NAME))
    root_back["version"] = new_version
    save_json(os.path.join(BASE_DIR, MANIFEST_NAME), root_back)

    # --- 6) Opera klasörünü oluştur ---
    create_opera_copy()

    print("\nBitti! Çıktılar hazır:")
    print(f"  Kaynak   : {BASE_DIR}")
    print(f"  Hedef    : {PACKAGE_DIR}")
    print(f"  Manifest : {PACKAGE_DIR}/{MANIFEST_NAME}  (sürüm {new_version})")
    print(f"  Opera    : {OPERA_DIR}  (hariç tutulanlar dışında kökün kopyası)")


if __name__ == "__main__":
    main()
