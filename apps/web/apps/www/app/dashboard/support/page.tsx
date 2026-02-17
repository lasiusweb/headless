'use client';

import { useState } from 'react';
import { DashboardLayout, Card } from '@kn/ui';
import { MessageSquare, Send, AlertTriangle, Headphones, FileText } from 'lucide-react';
import Link from 'next/link';

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState<'tickets' | 'feedback' | 'emergency'>('tickets');

  const tickets = [
    {
      id: 'TKT-001',
      subject: 'Order delivery delayed',
      status: 'open',
      priority: 'high',
      created: '2 days ago',
      lastUpdate: '5 hours ago',
    },
    {
      id: 'TKT-002',
      subject: 'Product inquiry - bulk pricing',
      status: 'in-progress',
      priority: 'medium',
      created: '1 week ago',
      lastUpdate: '1 day ago',
    },
  ];

  return (
    <DashboardLayout variant="b2b" logoText="KN Biosciences B2B">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Support</h1>
        <p className="text-gray-600">
          Get help with orders, products, or any questions you may have
        </p>
      </div>

      {/* Emergency Banner */}
      <Card className="p-6 mb-8 bg-red-50 border-red-200">
        <div className="flex items-start gap-4">
          <AlertTriangle className="h-8 w-8 text-red-600 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-bold text-red-900 mb-2">Safety Emergency?</h3>
            <p className="text-red-700 mb-4">
              If you're experiencing a product safety issue or need to report a recall, 
              please use our emergency reporting system for immediate assistance.
            </p>
            <Link href="/dashboard/support/emergency">
              <button className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 font-medium">
                Report Emergency
              </button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('tickets')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'tickets'
              ? 'border-b-2 border-green-600 text-green-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          My Tickets
        </button>
        <button
          onClick={() => setActiveTab('feedback')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'feedback'
              ? 'border-b-2 border-green-600 text-green-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Send Feedback
        </button>
        <button
          onClick={() => setActiveTab('emergency')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'emergency'
              ? 'border-b-2 border-red-600 text-red-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Emergency
        </button>
      </div>

      {/* Content */}
      {activeTab === 'tickets' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Support Tickets</h2>
            <Link href="/dashboard/support/tickets/new">
              <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-medium flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                New Ticket
              </button>
            </Link>
          </div>

          {tickets.length === 0 ? (
            <Card className="p-12 text-center">
              <MessageSquare className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="font-bold text-gray-900 mb-2">No tickets yet</h3>
              <p className="text-gray-600 mb-6">Create your first support ticket</p>
              <Link href="/dashboard/support/tickets/new">
                <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-medium">
                  Create Ticket
                </button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <Card key={ticket.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-bold text-gray-900">{ticket.id}</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          ticket.status === 'open' ? 'bg-green-100 text-green-700' :
                          ticket.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {ticket.status.replace('-', ' ').toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          ticket.priority === 'high' ? 'bg-red-100 text-red-700' :
                          ticket.priority === 'medium' ? 'bg-orange-100 text-orange-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {ticket.priority.toUpperCase()}
                        </span>
                      </div>
                      <h3 className="font-medium text-gray-900 mb-2">{ticket.subject}</h3>
                      <p className="text-sm text-gray-600">
                        Created: {ticket.created} • Last update: {ticket.lastUpdate}
                      </p>
                    </div>
                    <Link href={`/dashboard/support/tickets/${ticket.id}`}>
                      <button className="text-green-600 hover:text-green-700 font-medium">
                        View →
                      </button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'feedback' && (
        <Card className="p-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <Send className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Send Feedback</h2>
              <p className="text-gray-600">
                Help us improve by sharing your experience and suggestions
              </p>
            </div>

            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Feedback Type
                </label>
                <select className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent">
                  <option>Product Feedback</option>
                  <option>Service Feedback</option>
                  <option>Website Feedback</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Brief summary of your feedback"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  rows={6}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Please share your feedback in detail..."
                />
              </div>

              <div className="flex justify-end gap-4">
                <button type="button" className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">
                  Cancel
                </button>
                <button type="submit" className="bg-green-600 text-white px-8 py-2 rounded-lg hover:bg-green-700 font-medium">
                  Submit Feedback
                </button>
              </div>
            </form>
          </div>
        </Card>
      )}

      {activeTab === 'emergency' && (
        <Card className="p-8">
          <div className="max-w-2xl mx-auto text-center">
            <AlertTriangle className="h-16 w-16 text-red-600 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-red-900 mb-4">Report a Safety Emergency</h2>
            <p className="text-red-700 mb-8">
              For urgent safety concerns, product recalls, or adverse reactions. 
              Our safety team will respond within 2 hours.
            </p>

            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
              <h3 className="font-bold text-red-900 mb-4">Emergency Contact</h3>
              <div className="space-y-2 text-red-700">
                <p className="flex items-center justify-center gap-2">
                  <Headphones className="h-5 w-5" />
                  <span className="font-bold">24/7 Helpline: 1800-123-4567</span>
                </p>
                <p className="flex items-center justify-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  <span>WhatsApp: +91 98765 43210</span>
                </p>
                <p className="flex items-center justify-center gap-2">
                  <FileText className="h-5 w-5" />
                  <span>Email: safety@knbiosciences.in</span>
                </p>
              </div>
            </div>

            <Link href="/dashboard/support/emergency/new">
              <button className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 font-medium">
                File Emergency Report
              </button>
            </Link>
          </div>
        </Card>
      )}
    </DashboardLayout>
  );
}
