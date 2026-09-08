import React, { useState } from 'react';
import { schoolDataService } from '../../services/schoolDataService';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/common/Modal';
import Tabs from '../../components/common/Tabs';
import { FormInput, Select, Textarea } from '../../components/common/FormInput';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Calendar, Plus, MapPin, Clock, Users, CalendarDays, Filter } from 'lucide-react';

export default function EventsCalendarPage() {
  const { success } = useToast();
  const [events, setEvents] = useState(() => schoolDataService.getEvents());
  const [activeView, setActiveView] = useState('list');
  const [selectedType, setSelectedType] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [newEvent, setNewEvent] = useState({
    title: '',
    type: 'Cultural',
    date: '2025-11-20',
    startTime: '10:00 AM',
    endTime: '04:00 PM',
    location: 'Auditorium Hall',
    description: '',
    organizer: 'Student Council',
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newEvent.title) return;
    const created = schoolDataService.addEvent(newEvent);
    setEvents(schoolDataService.getEvents());
    setIsAddModalOpen(false);
    setNewEvent({
      title: '',
      type: 'Cultural',
      date: '2025-11-20',
      startTime: '10:00 AM',
      endTime: '04:00 PM',
      location: 'Auditorium Hall',
      description: '',
      organizer: 'Student Council',
    });
    success(`Event "${created.title}" scheduled on school calendar!`);
  };

  const filteredEvents = events.filter((e) => selectedType === 'All' || e.type === selectedType);

  const getTypeBadge = (type) => {
    if (type === 'Sports') return 'badge-success';
    if (type === 'Holiday') return 'badge-danger';
    if (type === 'Meeting') return 'badge-warning';
    if (type === 'Cultural') return 'badge-purple';
    return 'badge-primary';
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Calendar size={26} color="var(--primary)" />
            School Events & Academic Calendar
          </h1>
          <p className="page-subtitle">
            Schedule functions, sports meets, parent-teacher conferences and academic holidays
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
          <Plus size={16} />
          <span>Schedule New Event</span>
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
        <Tabs
          tabs={[
            { id: 'list', label: 'Agenda & Event List', icon: <CalendarDays size={15} /> },
            { id: 'month', label: 'Monthly Matrix View', icon: <Calendar size={15} /> },
          ]}
          activeTab={activeView}
          onChange={setActiveView}
          variant="pills"
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '0.825rem', fontWeight: 700 }}>Filter Category:</label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="form-select"
            style={{ width: '160px', height: '38px', fontSize: '0.85rem' }}
          >
            {['All', 'Sports', 'Meeting', 'Exhibition', 'Holiday', 'Cultural'].map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {activeView === 'list' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredEvents.map((evt) => (
            <div key={evt.id} className="card card-hover">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div
                    style={{
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-lg)',
                      backgroundColor: 'var(--primary-light)',
                      color: 'var(--primary)',
                      textAlign: 'center',
                      minWidth: '70px',
                    }}
                  >
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                      {new Date(evt.date).toLocaleDateString('en-US', { month: 'short' })}
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, lineHeight: '1.2' }}>
                      {new Date(evt.date).getDate()}
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>{evt.title}</h3>
                      <span className={`badge ${getTypeBadge(evt.type)}`}>{evt.type}</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                      {evt.description}
                    </p>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: 'var(--text-tertiary)', flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={13} /> {evt.startTime} – {evt.endTime}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={13} /> {evt.location}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Users size={13} /> Org: {evt.organizer}
                      </span>
                    </div>
                  </div>
                </div>

                <StatusBadge status={evt.status} size="sm" />
              </div>
            </div>
          ))}
        </div>
      )}

      {activeView === 'month' && (
        <div className="card">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px', textAlign: 'center' }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} style={{ fontWeight: 700, fontSize: '0.85rem', padding: '10px 0', color: 'var(--text-tertiary)' }}>
                {d}
              </div>
            ))}
            {Array.from({ length: 35 }).map((_, i) => {
              const dayNum = i - 2;
              const hasEvents = dayNum === 2 || dayNum === 5 || dayNum === 15 || dayNum === 27;
              return (
                <div
                  key={i}
                  style={{
                    minHeight: '80px',
                    padding: '8px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: dayNum > 0 && dayNum <= 30 ? 'var(--bg-tertiary)' : 'transparent',
                    opacity: dayNum > 0 && dayNum <= 30 ? 1 : 0.3,
                    textAlign: 'left',
                  }}
                >
                  <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>{dayNum > 0 && dayNum <= 30 ? dayNum : ''}</div>
                  {dayNum === 2 && <span className="badge badge-danger" style={{ fontSize: '0.65rem', marginTop: '4px' }}>Holiday</span>}
                  {dayNum === 5 && <span className="badge badge-success" style={{ fontSize: '0.65rem', marginTop: '4px' }}>Sports Meet</span>}
                  {dayNum === 15 && <span className="badge badge-primary" style={{ fontSize: '0.65rem', marginTop: '4px' }}>Mid-Term Exam</span>}
                  {dayNum === 27 && <span className="badge badge-warning" style={{ fontSize: '0.65rem', marginTop: '4px' }}>PTM Review</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Event Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Schedule School Event"
        subtitle="Add ceremony, holiday, or meeting to the master calendar"
      >
        <form onSubmit={handleAddSubmit}>
          <FormInput
            label="Event Title"
            required
            value={newEvent.title}
            onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
            placeholder="e.g. Annual Inter-School Science Fair"
          />
          <div className="grid-2">
            <Select
              label="Event Type"
              value={newEvent.type}
              onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
              options={['Sports', 'Meeting', 'Exhibition', 'Holiday', 'Cultural', 'Examination']}
            />
            <FormInput
              label="Event Date"
              type="date"
              value={newEvent.date}
              onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
            />
          </div>

          <div className="grid-2">
            <FormInput
              label="Start Time"
              value={newEvent.startTime}
              onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
              placeholder="09:00 AM"
            />
            <FormInput
              label="End Time"
              value={newEvent.endTime}
              onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
              placeholder="04:00 PM"
            />
          </div>

          <div className="grid-2">
            <FormInput
              label="Location / Hall"
              value={newEvent.location}
              onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
              placeholder="Main Stadium"
            />
            <FormInput
              label="Organizing Department"
              value={newEvent.organizer}
              onChange={(e) => setNewEvent({ ...newEvent, organizer: e.target.value })}
              placeholder="Physical Ed Dept"
            />
          </div>

          <Textarea
            label="Event Description"
            value={newEvent.description}
            onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
            placeholder="Details about program, participants and agenda..."
          />

          <div className="modal-footer" style={{ margin: '20px -24px -24px', padding: '16px 24px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Publish Event
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
