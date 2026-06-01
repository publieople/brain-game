"""TGAM (NeuroSky MindWave) serial protocol parser.

Protocol:
- Sync bytes: 0xAA 0xAA
- Big packet (0x20): attention(1B), meditation(1B), 8-band EEG(24B)
- Checksum: ~sum(payload) & 0xFF
"""

import struct
import logging
from typing import Optional

logger = logging.getLogger(__name__)

# Packet codes
SYNC_BYTE = 0xAA
BIG_PACKET = 0x20
SIGNAL_QUALITY = 0x02
ATTENTION = 0x04
MEDITATION = 0x05
EEG_POWER = 0x83  # 8-band EEG power (24 bytes)
RAW_WAVE = 0x80   # Raw wave (2 bytes)


class TGAMParser:
    """Parser for TGAM serial protocol."""

    def __init__(self) -> None:
        self._buffer = bytearray()
        self._sync_found = False

    def feed(self, data: bytes) -> list[dict]:
        """Feed raw bytes, return parsed packets."""
        self._buffer.extend(data)
        packets = []

        while len(self._buffer) >= 2:
            # Find sync
            if not self._sync_found:
                idx = self._buffer.find(bytes([SYNC_BYTE, SYNC_BYTE]))
                if idx < 0:
                    self._buffer.clear()
                    break
                if idx > 0:
                    del self._buffer[:idx]
                self._sync_found = True
                continue

            if len(self._buffer) < 4:
                break

            pkt_length = self._buffer[2]
            total_len = 3 + pkt_length + 1  # code + length + [payload] + checksum

            if len(self._buffer) < total_len:
                break

            payload = self._buffer[3:3 + pkt_length]
            checksum = self._buffer[3 + pkt_length]

            # Verify checksum
            calculated = (~sum(payload) & 0xFF)
            if checksum != calculated:
                logger.debug("Checksum mismatch: expected %d, got %d", calculated, checksum)
                # Skip first sync byte, try again
                self._buffer = self._buffer[1:]
                self._sync_found = False
                continue

            pkt_code = self._buffer[1]
            parsed = self._parse_packet(pkt_code, payload)
            if parsed:
                packets.append(parsed)

            del self._buffer[:total_len]
            self._sync_found = False

        return packets

    def _parse_packet(self, code: int, payload: bytes) -> Optional[dict]:
        """Parse a packet by its code."""
        if code == SIGNAL_QUALITY:
            return {"type": "signal_quality", "value": payload[0]}

        if code == ATTENTION:
            return {"type": "attention", "value": payload[0]}

        if code == MEDITATION:
            return {"type": "meditation", "value": payload[0]}

        if code == BIG_PACKET and len(payload) >= 26:
            return {
                "type": "big_packet",
                "attention": payload[0],
                "meditation": payload[1],
                "eeg_power": {
                    "delta": struct.unpack(">I", payload[2:6])[0],
                    "theta": struct.unpack(">I", payload[6:10])[0],
                    "low_alpha": struct.unpack(">I", payload[10:14])[0],
                    "high_alpha": struct.unpack(">I", payload[14:18])[0],
                    "low_beta": struct.unpack(">I", payload[18:22])[0],
                    "high_beta": struct.unpack(">I", payload[22:26])[0],
                },
            }

        if code == RAW_WAVE and len(payload) >= 2:
            raw_value = struct.unpack(">h", payload[:2])[0]
            return {"type": "raw_wave", "value": raw_value}

        # Extended 8-band EEG (for packets with 24B after attn/med)
        known_small = {SIGNAL_QUALITY, ATTENTION, MEDITATION}
        if code not in known_small and code != BIG_PACKET and code != RAW_WAVE and len(payload) == 24:
            return {
                "type": "eeg_power",
                "eeg_power": {
                    "delta": struct.unpack(">I", payload[0:4])[0],
                    "theta": struct.unpack(">I", payload[4:8])[0],
                    "low_alpha": struct.unpack(">I", payload[8:12])[0],
                    "high_alpha": struct.unpack(">I", payload[12:16])[0],
                    "low_beta": struct.unpack(">I", payload[16:20])[0],
                    "high_beta": struct.unpack(">I", payload[20:24])[0],
                },
            }

        return None
