import React, { useState, useEffect } from 'react';
import { Calendar, Plus, MapPin, Users, Clock } from 'lucide-react';
import DataTable from '../../components/tables/DataTable';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import FormModal from '../../components/modals/FormModal';
import Input from '../../components/common/Input';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { eventService } from '../../services';

export default function EventsPage() {
  const { role } = useAuth();
  const { addToast } = useToast();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    date: '',
    location: '',
    organizer: '',
    attendees: 100,
  });

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await eventService.getEventsByRole(role);
      setEvents(data || []);
    } catch (err) {
      addToast('Failed to load events', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [role]);

  const handleSaveAdd = async (e) => {
    e.preventDefault();
    try {
      const newEv = await eventService.createEvent(role, formData);
      setEvents([...events, newEv]);
      setIsAddOpen(false);
      addToast(`Event "${formData.title}" scheduled`, 'success');
    } catch (err) {
      addToast('Failed to schedule event', 'error');
    }
  };

  const columns = [
    {
      key: 'title',
      label: 'Event Title',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.title}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Organized by: {row.organizer}</div>
        </div>
      ),
    },
    {
      key: 'date',
      label: 'Event Date',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px' }}>
          <Calendar size={13} style={{ color: 'var(--text-muted)' }} />
          <span>{row.date}</span>
        </div>
      ),
    },
    {
      key: 'location',
      label: 'Venue / Location',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px' }}>
          <MapPin size={13} style={{ color: 'var(--text-muted)' }} />
          <span>{row.location}</span>
        </div>
      ),
    },
    {
      key: 'attendees',
      label: 'Expected Attendees',
      render: (row) => <strong>{row.attendees.toLocaleString()} Attendees</strong>,
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Institution Events & Conclaves</h1>
          <p className="page-subtitle">Schedule summits, cultural festivals, conferences, and sports meets</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setIsAddOpen(true)}>
          Schedule Event
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={events}
        title="Event Calendar & Venues"
        subtitle="Manage campus ceremonies and athletic competitions"
        searchPlaceholder="Search events..."
        searchKeys={['title', 'location', 'organizer']}
        onAdd={() => setIsAddOpen(true)}
        addLabel="Add Event"
      />

      <FormModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSubmit={handleSaveAdd}
        title="Schedule Campus Event"
        subtitle="Publicize ceremony or workshop"
      >
        <Input
          label="Event Title"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g. Annual Alumni Conclave 2026"
        />
        <div className="grid-2">
          <Input
            label="Event Date"
            type="date"
            required
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
          <Input
            label="Expected Attendees"
            type="number"
            value={formData.attendees}
            onChange={(e) => setFormData({ ...formData, attendees: Number(e.target.value) })}
          />
        </div>
        <div className="grid-2">
          <Input
            label="Venue / Hall"
            required
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="Main Auditorium"
          />
          <Input
            label="Organizing Body"
            value={formData.organizer}
            onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
            placeholder="Student Affairs"
          />
        </div>
      </FormModal>
    </div>
  );
}
