import React, { useState, useRef, useEffect } from 'react';
import './Newspaper.css';

// --- SUB-COMPONENTS ---
const ListSection = ({ title, items, onAdd, onToggle, onUpdate, type }) => (
  <section className="log-section mb-10">
    <h3 className="section-title">{title}</h3>
    <div className="list-container mb-2">
      {items.map((item, i) => (
        <div key={i} className="list-row">
          {type === 'event' ? (
            <span 
              className={`bullet-toggle cursor-pointer ${item.completed ? 'opacity-100' : 'opacity-40'}`}
              onClick={() => onToggle(i)}
            >
              {item.completed ? '●' : '○'} 
            </span>
          ) : (
            <input 
              type="checkbox" 
              className="newspaper-checkbox"
              checked={item.completed}
              onChange={() => onToggle(i)}
            />
          )}
          <input 
            className={`list-input ${item.completed ? 'strikethrough' : ''}`}
            value={item.text}
            placeholder={type === 'event' ? "Event description..." : "New task..."}
            onChange={(e) => onUpdate(i, e.target.value)}
          />
        </div>
      ))}
    </div>
    <button onClick={onAdd} className="add-btn">+ Add {title.slice(0, -1)}</button>
  </section>
);

const Dashboard = ({ user, onLogout }) => {
  // --- STATE MANAGEMENT ---
  const [currentDate, setCurrentDate] = useState(new Date());
  const [entryText, setEntryText] = useState("");
  const [events, setEvents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [mood, setMood] = useState(null);
  const [image, setImage] = useState(null);
  
  // Profile state (usually stays the same across days)
  const [profileImage, setProfileImage] = useState(user?.profile?.image || null);
  const [profileName, setProfileName] = useState(user?.profile?.name || "");
  const [profileBio, setProfileBio] = useState(user?.profile?.bio || "");

  const fileInputRef = useRef(null);
  const profileInputRef = useRef(null);

  // Formatting date for Display and DB key
  const dateKey = currentDate.toLocaleDateString('en-US', { 
    weekday: 'long', month: 'long', day: 'numeric' 
  });

  // --- DATABASE HANDLERS ---

  // Load entry whenever the date changes
  useEffect(() => {
    const fetchEntry = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/entry/${user.userId}/${dateKey}`);
        const data = await response.json();

        if (data && data._id) {
          setEntryText(data.entryText || "");
          setEvents(data.events || []);
          setTasks(data.tasks || []);
          setMood(data.mood || "");
          setImage(data.image || null);
        } else {
          // Clear fields for a new day
          setEntryText("");
          setEvents([]);
          setTasks([]);
          setMood("");
          setImage(null);
        }
      } catch (err) {
        console.error("Error retrieving archives:", err);
      }
    };

    if (user?.userId) fetchEntry();
  }, [dateKey, user.userId]);

  const saveEntry = async () => {
    const payload = {
      userId: user.userId,
      date: dateKey,
      entryText,
      events,
      tasks,
      mood,
      image
    };

    try {
      const response = await fetch('http://localhost:5000/api/entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (response.ok) alert("The Crépuscule have been updated.");
    } catch (err) {
      alert("Could not connect to server.");
    }
  };

  // --- UI HANDLERS ---
  const handleFileChange = (e, setter) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setter(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const changeDate = (days) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    setCurrentDate(newDate);
  };

  return (
    <div className="newspaper-container">
      <header className="masthead">
        <div className="masthead-meta">
          <span>CRÉPUSCULE, A Cardinal Record of Dawn & Intuition</span>
          <span>{dateKey.toUpperCase()} ISSUE</span>
        </div>
        <h1 className="headline-main">The Solstice Matins</h1>
        
        <nav className="nav-bar flex justify-between items-center border-y border-black py-2 mt-4">
          <div className="flex gap-4">
            <button className="nav-btn" onClick={() => changeDate(-1)}>← Previous Issue</button>
            <button className="nav-btn" onClick={() => setCurrentDate(new Date())}>Today</button>
            <button className="nav-btn" onClick={() => changeDate(1)}>Next Issue →</button>
          </div>
          
          <div className="flex gap-4">
            <button className="nav-btn font-bold" onClick={saveEntry}>Save Entry</button>
            <button className="nav-btn text-red-600" onClick={onLogout}>Log out</button>
          </div>
        </nav>
      </header>

      <main className="main-layout">
        {/* Left Column */}
        <aside className="col-1">
          <h2 className="text-3xl font-bold mb-8 italic tracking-tighter">{dateKey}</h2>
          
          <ListSection 
            title="Events" 
            items={events} 
            type="event"
            onAdd={() => setEvents([...events, { text: "", completed: false }])}
            onToggle={(i) => {
                const newList = [...events];
                newList[i].completed = !newList[i].completed;
                setEvents(newList);
            }}
            onUpdate={(i, val) => {
                const newList = [...events];
                newList[i].text = val;
                setEvents(newList);
            }}
          />

          <ListSection 
            title="Tasks" 
            items={tasks} 
            type="task"
            onAdd={() => setTasks([...tasks, { text: "", completed: false }])}
            onToggle={(i) => {
                const newList = [...tasks];
                newList[i].completed = !newList[i].completed;
                setTasks(newList);
            }}
            onUpdate={(i, val) => {
                const newList = [...tasks];
                newList[i].text = val;
                setTasks(newList);
            }}
          />
        </aside>

        {/* Center Column */}
        <article className="col-2">
          <textarea 
            className="journal-input" 
            placeholder="Write your thoughts here..."
            value={entryText}
            onChange={(e) => setEntryText(e.target.value)}
          />
          
          <div className="photo-placeholder" onClick={() => fileInputRef.current?.click()}>
            {image ? (
              <img src={image} alt="Journal" className="uploaded-photo" />
            ) : (
              <span className="placeholder-text">[Click to upload photo]</span>
            )}
            <input type="file" ref={fileInputRef} onChange={(e) => handleFileChange(e, setImage)} className="hidden" accept="image/*" />
          </div>
        </article>

        {/* Right Column */}
        <aside className="col-3">
          <section className="profile-box mb-12">
            <div className="profile-img-container" onClick={() => profileInputRef.current?.click()}>
               {profileImage ? <img src={profileImage} alt="Profile" className="uploaded-photo" /> : <div className="placeholder-text">[Upload Profile]</div>}
               <input type="file" ref={profileInputRef} onChange={(e) => handleFileChange(e, setProfileImage)} className="hidden" accept="image/*" />
            </div>
            <input className="profile-name-input" value={profileName} onChange={(e) => setProfileName(e.target.value)} placeholder="Your Name" />
            <textarea className="profile-bio-input" value={profileBio} onChange={(e) => setProfileBio(e.target.value)} placeholder="Short description..." />
          </section>

          {/* This acts as your Archive Navigator now as requested */}
          <section className="navigation-controls p-4 border border-black bg-white/50">
            <h3 className="section-title text-center mb-4">Archive Navigator</h3>
            <div className="flex flex-col gap-2">
                <button className="nav-btn w-full" onClick={() => changeDate(-1)}>Go Back One Day</button>
                <button className="nav-btn w-full" onClick={() => changeDate(1)}>Go Forward One Day</button>
                <p className="text-center text-xs mt-2 italic">Current Issue: {dateKey}</p>
            </div>
          </section>
        </aside>
      </main>
      
      <footer className="footer-bar">
        <span>EST. 2026 | A new dawn begins.</span>
      </footer>
    </div>
  );
};

export default Dashboard;