'use client';

import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function JoinForm({ onJoined }) {
  const [file, setFile] = useState(null);
  const [handle, setHandle] = useState('');
  const [status, setStatus] = useState('');
  const [spot, setSpot] = useState(null);
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!file) return setStatus('Add your face first.');
    setBusy(true);
    setStatus('Getting you into Snackin…');

    try {
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
      const safe = `${crypto.randomUUID()}.${ext}`;
      const path = `participants/${safe}`;

      const { error: uploadError } = await supabase.storage
        .from('faces')
        .upload(path, file, { cacheControl: '3600', upsert: false, contentType: file.type });

      if (uploadError) throw uploadError;

      const { data, error } = await supabase.rpc('claim_snackin', {
        p_instagram_handle: handle.replace(/^@/, '').trim(),
        p_image_path: path
      });

      if (error) throw error;

      const row = Array.isArray(data) ? data[0] : data;
      setSpot(row.spot_number);
      setStatus('YOU’RE IN.');
      onJoined?.(row);
    } catch (err) {
      console.error(err);
      setStatus(err.message || 'Something went wrong. Try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="join-card" onSubmit={submit}>
      <div className="eyebrow">GET YOUR FACE IN</div>
      <h2>Become part of the logo.</h2>
      <p>Upload your best Snackin face. We’ll give you a unique Snackin Spot.</p>

      <label className="upload-box">
        {file ? (
          <>
            <img src={URL.createObjectURL(file)} alt="" />
            <span>Change photo</span>
          </>
        ) : (
          <>
            <b>+</b>
            <span>Upload your face</span>
          </>
        )}
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      </label>

      <input
        className="text-input"
        placeholder="@instagramhandle"
        value={handle}
        onChange={(e) => setHandle(e.target.value)}
      />

      <button className="red-button" disabled={busy}>
        {busy ? 'ADDING YOU…' : 'GET INTO SNACKIN →'}
      </button>

      {status && <div className="form-status">{status}</div>}

      {spot && (
        <div className="spot-result">
          <span>Your Snackin Spot</span>
          <strong>#{Number(spot).toLocaleString('en-IN')}</strong>
          <small>Your face is now part of the live artwork.</small>
        </div>
      )}
    </form>
  );
}
