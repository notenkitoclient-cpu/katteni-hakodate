"use client";

import { useEffect, useState } from 'react';

export default function OpenBadge({ hoursString }: { hoursString: string | null }) {
  const [status, setStatus] = useState<"OPEN" | "CLOSED" | "UNKNOWN">("UNKNOWN");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!hoursString) return;

    // 簡単なパース処理： "10:00 - 18:00" のような部分を抽出する
    // ※ MVP向けに簡略化（定休日のパースなどは除外または別途実装が必要）
    const match = hoursString.match(/(\d{1,2}):(\d{2})\s*(?:-|〜|~)\s*(\d{1,2}):(\d{2})/);
    
    if (match) {
      const now = new Date();
      const currentH = now.getHours();
      const currentM = now.getMinutes();
      const currentTime = currentH * 60 + currentM;

      const startH = parseInt(match[1], 10);
      const startM = parseInt(match[2], 10);
      const startTime = startH * 60 + startM;

      const endH = parseInt(match[3], 10);
      const endM = parseInt(match[4], 10);
      const endTime = endH * 60 + endM;

      // 日替わり（23:00 - 02:00など）は考慮を省くか、簡易判定
      if (endTime < startTime) {
        // 夜跨ぎの簡易判定（例：18:00〜02:00の場合）
        if (currentTime >= startTime || currentTime <= endTime) {
          setStatus("OPEN");
        } else {
          setStatus("CLOSED");
        }
      } else {
        if (currentTime >= startTime && currentTime <= endTime) {
          setStatus("OPEN");
        } else {
          setStatus("CLOSED");
        }
      }
    } else {
      // "24時間営業" のような文字列をハンドリング
      if (hoursString.includes('24時間')) {
        setStatus("OPEN");
      }
    }
  }, [hoursString]);

  if (!mounted || status === "UNKNOWN") {
    // サーバーサイド・または判定不能時は何も出さない（デザインを崩さないため）
    return null;
  }

  return (
    <div className="bg-foreground text-background px-4 py-2 font-tele font-bold text-sm tracking-widest inline-flex items-center">
      {status === "OPEN" ? (
        <><span className="text-green-400 mr-2 text-lg leading-none">●</span>OPEN NOW</>
      ) : (
        <><span className="text-red-500 mr-2 text-lg leading-none">●</span>CLOSED</>
      )}
    </div>
  );
}
