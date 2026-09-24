'use client';

import { useState } from 'react';
import SnackinArtwork from '../components/SnackinArtwork';
import JoinForm from '../components/JoinForm';

export default function Home() {
  const [latest, setLatest] = useState(null);

  return (
    <main>
      <nav className="nav">
        <div className="wordmark">BRITANNIA <span>SNACKIN</span></div>
        <div className="navlinks">
          <a href="#home">HOME</a>
          <a href="#find">FIND YOURSELF</a>
          <a href="#community">THE COMMUNITY</a>
        </div>
        <a className="nav-cta" href="#join">GET INTO SNACKIN →</a>
      </nav>

      <section id="home" className="hero">
        <div className="hero-copy">
          <div className="eyebrow">THE COMMUNITY IS MAKING THIS</div>
          <h1>GET INTO<br/><span>SNACKIN.</span></h1>
          <p>Every person who joins adds another face to the growing Snackin artwork. Follow us, send your face and become a part of it.</p>
          <a className="red-button hero-button" href="#join">GET INTO SNACKIN →</a>
          <div className="steps">
            <div><b>01</b><strong>FOLLOW</strong><small>@britanniasnackin</small></div>
            <div><b>02</b><strong>SEND</strong><small>your Snackin face</small></div>
            <div><b>03</b><strong>GET IN</strong><small>be part of the artwork</small></div>
            <div><b>04</b><strong>FIND</strong><small>your exact spot</small></div>
          </div>
        </div>

        <div id="community" className="hero-art">
          <SnackinArtwork onLiveParticipant={setLatest} />
        </div>
      </section>

      {latest && (
        <div className="live-toast">
          <span className="live-dot" />
          <b>Someone just got into Snackin.</b>
          <span>Spot #{Number(latest.spot_number).toLocaleString('en-IN')}</span>
        </div>
      )}

      <section id="join" className="join-section">
        <div>
          <div className="eyebrow">YOUR TURN</div>
          <h2>YOU COULD BE<br/><span>IN THE LOGO.</span></h2>
          <p>One face at a time, we’re turning the Snackin community into the Snackin logo.</p>
        </div>
        <JoinForm onJoined={(row) => setLatest(row)} />
      </section>

      <section id="find" className="find-section">
        <div className="eyebrow">COMING NEXT</div>
        <h2>FIND YOURSELF.</h2>
        <p>Once you’re in, enter your Snackin Spot and watch the artwork zoom all the way into your face.</p>
        <div className="find-demo">
          <span>SNACKIN SPOT</span>
          <strong>#87,324</strong>
          <button onClick={() => alert('The live Find Yourself search will use your Snackin Spot from Supabase.')}>FIND ME →</button>
        </div>
      </section>

      <footer>
        <b>BRITANNIA SNACKIN</b>
        <span>MADE BY EVERYONE WHO FOLLOWED.</span>
      </footer>
    </main>
  );
}
