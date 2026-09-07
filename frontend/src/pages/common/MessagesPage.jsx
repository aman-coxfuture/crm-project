import React, { useState, useEffect } from 'react';
import { MessageSquare, Plus, Send, Search, CheckCircle2 } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';
import FormModal from '../../components/modals/FormModal';
import { useToast } from '../../context/ToastContext';
import { messageService } from '../../services';

export default function MessagesPage() {
  const { addToast } = useToast();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMessage, setActiveMessage] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isComposeOpen, setIsComposeOpen] = useState(false);

  const [composeForm, setComposeForm] = useState({
    recipient: '',
    role: 'Administration',
    subject: '',
    content: '',
  });

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const data = await messageService.getMessages();
      setMessages(data || []);
      if (data && data.length > 0 && !activeMessage) {
        setActiveMessage(data[0]);
      }
    } catch (err) {
      addToast('Failed to load messages', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    addToast('Reply dispatched successfully', 'success');
    setReplyText('');
  };

  const handleSendCompose = async (e) => {
    e.preventDefault();
    try {
      const newMsg = await messageService.sendMessage({
        sender: composeForm.recipient,
        role: composeForm.role,
        subject: composeForm.subject,
        content: composeForm.content,
      });
      setMessages([newMsg, ...messages]);
      setActiveMessage(newMsg);
      setIsComposeOpen(false);
      setComposeForm({ recipient: '', role: 'Administration', subject: '', content: '' });
      addToast(`Message dispatched to ${composeForm.recipient}`, 'success');
    } catch (err) {
      addToast('Failed to dispatch message', 'error');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Direct Messages & Communications</h1>
          <p className="page-subtitle">Inter-departmental messaging, administration dispatch, and student communications</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setIsComposeOpen(true)}>
          Compose Message
        </Button>
      </div>

      <div className="grid-3" style={{ gridTemplateColumns: '1fr 2fr', minHeight: '520px', alignItems: 'stretch' }}>
        {/* Messages List */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-secondary)' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Inbox ({messages.length})</span>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {messages.map((msg) => {
              const isSelected = activeMessage?.id === msg.id;
              return (
                <div
                  key={msg.id}
                  onClick={() => setActiveMessage(msg)}
                  style={{
                    padding: '14px 16px',
                    borderBottom: '1px solid var(--border-light)',
                    backgroundColor: isSelected ? 'var(--bg-tertiary)' : msg.unread ? 'var(--bg-secondary)' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'background var(--transition-fast)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '13px', fontWeight: msg.unread || isSelected ? 700 : 500, color: 'var(--text-primary)' }}>
                      {msg.sender}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{msg.time}</span>
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>
                    {msg.role}
                  </div>
                  <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {msg.subject}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Message View & Reply Box */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          {activeMessage ? (
            <>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '14px', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div>
                    <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>{activeMessage.subject}</h2>
                    <div style={{ fontSize: '12.5px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                      From: <strong style={{ color: 'var(--text-primary)' }}>{activeMessage.sender}</strong> ({activeMessage.role})
                    </div>
                  </div>
                  <Badge variant="outline">{activeMessage.time}</Badge>
                </div>

                <div style={{ padding: '20px 0', fontSize: '13.5px', color: 'var(--text-primary)', lineHeight: 1.6 }}>
                  <p>Dear Administrator,</p>
                  <p style={{ marginTop: '10px' }}>
                    Please review the attached memorandum regarding {activeMessage.subject.toLowerCase()}. We have prepared the documentation according to regulatory compliance and guidelines.
                  </p>
                  <p style={{ marginTop: '10px' }}>
                    Kindly advise on the subsequent approval workflow.
                  </p>
                  <p style={{ marginTop: '14px' }}>
                    Warm regards,<br />
                    <strong>{activeMessage.sender}</strong>
                  </p>
                </div>
              </div>

              <form onSubmit={handleSendReply} style={{ marginTop: 'auto', paddingTop: '14px', borderTop: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Type your reply message..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  />
                  <Button type="submit" variant="primary" icon={Send}>
                    Reply
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-tertiary)' }}>
              Select a message thread from the left to read and respond.
            </div>
          )}
        </div>
      </div>

      {/* Compose Modal */}
      <FormModal
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        onSubmit={handleSendCompose}
        title="Compose Message"
        subtitle="Internal CRM Communication"
        submitLabel="Send Message"
      >
        <Input
          label="Recipient Name / Office"
          required
          value={composeForm.recipient}
          onChange={(e) => setComposeForm({ ...composeForm, recipient: e.target.value })}
          placeholder="e.g. Dean of Academic Affairs"
        />
        <Input
          label="Subject"
          required
          value={composeForm.subject}
          onChange={(e) => setComposeForm({ ...composeForm, subject: e.target.value })}
          placeholder="Subject title"
        />
        <div className="form-group">
          <label className="form-label">Message Content</label>
          <textarea
            className="form-textarea"
            rows={4}
            value={composeForm.content}
            onChange={(e) => setComposeForm({ ...composeForm, content: e.target.value })}
            placeholder="Type your message here..."
          />
        </div>
      </FormModal>
    </div>
  );
}
