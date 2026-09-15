#!/usr/bin/env python3
"""Generate deterministic Roster Pulse launcher assets with stdlib only."""

from __future__ import annotations

import math
import struct
import zlib
from pathlib import Path


ASSETS = Path(__file__).resolve().parents[1] / "assets"

CANVAS = (7, 11, 18, 255)
CANVAS_GLOW = (16, 30, 45, 255)
GRID = (56, 189, 248, 30)
INFO = (56, 189, 248, 255)
ACCENT = (163, 230, 53, 255)
WHITE = (255, 255, 255, 255)
TRANSPARENT = (0, 0, 0, 0)


def composite(dst: tuple[int, int, int, int], src: tuple[int, int, int, int], opacity: float):
    source_alpha = (src[3] / 255) * max(0.0, min(1.0, opacity))
    dest_alpha = dst[3] / 255
    out_alpha = source_alpha + dest_alpha * (1 - source_alpha)
    if out_alpha == 0:
        return TRANSPARENT
    channels = [
        round(
            (
                src[index] * source_alpha
                + dst[index] * dest_alpha * (1 - source_alpha)
            )
            / out_alpha
        )
        for index in range(3)
    ]
    return (*channels, round(out_alpha * 255))


def mix(start: tuple[int, int, int, int], end: tuple[int, int, int, int], amount: float):
    amount = max(0.0, min(1.0, amount))
    return tuple(
        round(start[index] + (end[index] - start[index]) * amount)
        for index in range(4)
    )


def distance_to_segment(px: float, py: float, start: tuple[float, float], end: tuple[float, float]):
    sx, sy = start
    ex, ey = end
    dx = ex - sx
    dy = ey - sy
    if dx == 0 and dy == 0:
        return math.hypot(px - sx, py - sy)
    amount = max(0.0, min(1.0, ((px - sx) * dx + (py - sy) * dy) / (dx * dx + dy * dy)))
    return math.hypot(px - (sx + amount * dx), py - (sy + amount * dy))


def coverage(distance: float, half_width: float):
    return max(0.0, min(1.0, half_width + 0.8 - distance))


def render(
    width: int,
    height: int,
    *,
    background: bool,
    include_grid: bool,
    include_mark: bool,
    monochrome: bool = False,
):
    size = min(width, height)
    center_x = width / 2
    center_y = height / 2
    ring_color = WHITE if monochrome else INFO
    pulse_color = WHITE if monochrome else ACCENT
    pulse_points = [
        (0.19, 0.52),
        (0.34, 0.52),
        (0.42, 0.35),
        (0.51, 0.69),
        (0.61, 0.41),
        (0.68, 0.52),
        (0.81, 0.52),
    ]
    pulse_points = [
        (center_x + (x - 0.5) * size, center_y + (y - 0.5) * size)
        for x, y in pulse_points
    ]
    pulse_width = max(2.0, size * 0.032)
    ring_width = max(1.0, size * 0.012)
    pixels = bytearray(width * height * 4)

    for y in range(height):
        for x in range(width):
            if background:
                radial = min(
                    1.0,
                    math.hypot(x - center_x, y - center_y) / (size * 0.72),
                )
                pixel = mix(CANVAS_GLOW, CANVAS, radial)
            else:
                pixel = TRANSPARENT

            if include_grid:
                grid_step = size / 6
                grid_distance = min(
                    abs((x - center_x + grid_step / 2) % grid_step - grid_step / 2),
                    abs((y - center_y + grid_step / 2) % grid_step - grid_step / 2),
                )
                pixel = composite(pixel, GRID, coverage(grid_distance, max(0.5, size * 0.0015)))

            if include_mark:
                radius = math.hypot(x - center_x, y - center_y)
                for ring_radius, opacity in (
                    (size * 0.20, 0.55),
                    (size * 0.31, 0.34),
                ):
                    ring_coverage = coverage(abs(radius - ring_radius), ring_width / 2)
                    if ring_coverage:
                        pixel = composite(pixel, ring_color, ring_coverage * opacity)

                pulse_distance = min(
                    distance_to_segment(x, y, pulse_points[index], pulse_points[index + 1])
                    for index in range(len(pulse_points) - 1)
                )
                pulse_coverage = coverage(pulse_distance, pulse_width / 2)
                if pulse_coverage:
                    pixel = composite(pixel, pulse_color, pulse_coverage)

                dot_distance = math.hypot(x - center_x, y - center_y)
                dot_coverage = coverage(dot_distance, size * 0.025)
                if dot_coverage:
                    pixel = composite(pixel, pulse_color, dot_coverage)

            offset = (y * width + x) * 4
            pixels[offset : offset + 4] = bytes(pixel)

    return pixels


def write_png(path: Path, width: int, height: int, pixels: bytearray):
    def chunk(kind: bytes, payload: bytes):
        return (
            struct.pack(">I", len(payload))
            + kind
            + payload
            + struct.pack(">I", zlib.crc32(kind + payload) & 0xFFFFFFFF)
        )

    scanlines = b"".join(
        b"\x00" + bytes(pixels[row * width * 4 : (row + 1) * width * 4])
        for row in range(height)
    )
    header = struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)
    path.write_bytes(
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", header)
        + chunk(b"IDAT", zlib.compress(scanlines, 9))
        + chunk(b"IEND", b"")
    )


def generate():
    jobs = [
        ("icon.png", 1024, 1024, dict(background=True, include_grid=True, include_mark=True)),
        ("splash-icon.png", 1024, 1024, dict(background=True, include_grid=False, include_mark=True)),
        (
            "android-icon-background.png",
            512,
            512,
            dict(background=True, include_grid=True, include_mark=False),
        ),
        (
            "android-icon-foreground.png",
            512,
            512,
            dict(background=False, include_grid=False, include_mark=True),
        ),
        (
            "android-icon-monochrome.png",
            432,
            432,
            dict(
                background=False,
                include_grid=False,
                include_mark=True,
                monochrome=True,
            ),
        ),
        ("favicon.png", 48, 48, dict(background=True, include_grid=False, include_mark=True)),
    ]
    ASSETS.mkdir(parents=True, exist_ok=True)
    for filename, width, height, options in jobs:
        write_png(ASSETS / filename, width, height, render(width, height, **options))


if __name__ == "__main__":
    generate()
