'use client';

import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';

const MASK = '/snackin-mask.png';
const TILE_COUNT = 4096; // visual slots; database can contain far more participants
const GRID = 64;

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function publicFaceUrl(path) {
  const { data } = supabase.storage.from('faces').getPublicUrl(path);
  return data.publicUrl;
}

export default function SnackinArtwork({ onLiveParticipant }) {
  const canvasRef = useRef(null);
  const maskRef = useRef(null);
  const participantsRef = useRef([]);
  const [count, setCount] = useState(0);
  const [pulse, setPulse] = useState(false);

  async function fetchParticipants() {
    const { data, count: total, error } = await supabase
      .from('participants')
      .select('id,spot_number,image_path,slot_index,instagram_handle,created_at', { count: 'exact' })
      .order('created_at', { ascending: true })
      .limit(TILE_COUNT);

    if (!error) {
      participantsRef.current = data || [];
      setCount(total || (data || []).length);
      render();
    }
  }

  async function render() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const size = 960;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = '100%';
    canvas.style.height = 'auto';

    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = '#f4ead6';
    ctx.fillRect(0, 0, size, size);

    const participants = participantsRef.current;
    const cell = size / GRID;

    // Draw every available participant into a deterministic slot.
    // Empty slots remain warm cream until real people join.
    for (let i = 0; i < Math.min(participants.length, TILE_COUNT); i++) {
      const p = participants[i];
      try {
        const img = await loadImage(publicFaceUrl(p.image_path));
        const x = (i % GRID) * cell;
        const y = Math.floor(i / GRID) * cell;
        const s = Math.max(cell, 1);
        const scale = Math.max(s / img.width, s / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        ctx.drawImage(img, x + (s-w)/2, y + (s-h)/2, w, h);
      } catch {
        // Skip an unavailable image; the live artwork keeps rendering.
      }
    }

    // Apply the exact Snackin silhouette as alpha.
    try {
      if (!maskRef.current) maskRef.current = await loadImage(MASK);
      const maskCanvas = document.createElement('canvas');
      maskCanvas.width = size;
      maskCanvas.height = size;
      const mctx = maskCanvas.getContext('2d');
      mctx.drawImage(maskRef.current, 0, 0, size, size);

      const image = ctx.getImageData(0, 0, size, size);
      const mask = mctx.getImageData(0, 0, size, size);
      for (let i = 0; i < image.data.length; i += 4) {
        image.data[i + 3] = mask.data[i];
      }
      ctx.putImageData(image, 0, 0);
    } catch {}

    // A subtle outline helps the silhouette read immediately.
    const outline = new Image();
    outline.onload = () => {
      ctx.globalAlpha = 0.9;
      ctx.drawImage(outline, 0, 0, size, size);
      ctx.globalAlpha = 1;
    };
    outline.src = '/snackin-outline.png';
  }

  useEffect(() => {
    fetchParticipants();

    const channel = supabase
      .channel('snackin-live-artwork')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'participants' },
        (payload) => {
          participantsRef.current = [
            ...participantsRef.current,
            payload.new
          ].slice(-TILE_COUNT);
          setCount((c) => c + 1);
          setPulse(true);
          setTimeout(() => setPulse(false), 900);
          onLiveParticipant?.(payload.new);
          render();
        }
      )
      .subscribe();

    const resize = () => render();
    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className={`artwork-shell ${pulse ? 'pulse' : ''}`}>
      <div className="artwork-live"><span /> LIVE COMMUNITY ARTWORK</div>
      <canvas ref={canvasRef} aria-label="Britannia Snackin logo made from participant faces" />
      <div className="artwork-meta">
        <strong>{count.toLocaleString('en-IN')}</strong>
        <span>people are currently in Snackin</span>
      </div>
    </div>
  );
}
