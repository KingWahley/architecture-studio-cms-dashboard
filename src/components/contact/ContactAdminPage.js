"use client";

import { useMemo, useState, useTransition } from "react";
import { Eye, Plus, Save, Search, Trash2, X } from "lucide-react";
import { deleteContentItem, saveContactDetailsAction } from "@/app/actions/content";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/lib/utils";

function formatDateTime(value) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function createEmptyPlatform() {
  return {
    id: `contact-platform-${crypto.randomUUID()}`,
    platform: "",
    url: "",
  };
}

function normalizeContactDetails(details) {
  return {
    address: details?.address ?? "",
    mapEmbedUrl: details?.mapEmbedUrl ?? "",
    phones: Array.isArray(details?.phones) && details.phones.length > 0 ? details.phones : [""],
    email: details?.email ?? "",
    socials: {
      facebook: details?.socials?.facebook ?? "",
      instagram: details?.socials?.instagram ?? "",
      twitter: details?.socials?.twitter ?? "",
      linkedin: details?.socials?.linkedin ?? "",
    },
    additionalPlatforms:
      Array.isArray(details?.additionalPlatforms) && details.additionalPlatforms.length > 0
        ? details.additionalPlatforms
        : [],
  };
}

function FeedbackBanner({ feedback }) {
  if (!feedback) {
    return null;
  }

  return (
    <div
      className={
        feedback.type === "error"
          ? "rounded-2xl border border-error/25 bg-error/10 px-4 py-3 text-sm text-error"
          : "rounded-2xl border border-status-active/25 bg-status-active/10 px-4 py-3 text-sm text-status-active"
      }
    >
      {feedback.message}
    </div>
  );
}

function TabButton({ active, children, ...props }) {
  return (
    <button
      type="button"
      className={cn(
        "rounded-full px-4 py-2 text-sm font-medium transition-colors",
        active ? "bg-accent-deep-blue text-white" : "bg-surface-main text-text-secondary hover:bg-surface-alt hover:text-on-surface",
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export default function ContactAdminPage({ initialContactDetails, initialMessages }) {
  const [activeTab, setActiveTab] = useState("details");
  const [contactDetails, setContactDetails] = useState(() => normalizeContactDetails(initialContactDetails));
  const [messages, setMessages] = useState(initialMessages);
  const [query, setQuery] = useState("");
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [isPending, startTransition] = useTransition();

  const filteredMessages = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return messages;
    }

    return messages.filter((message) =>
      [message.name, message.email, message.subject, message.preview, message.body]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalizedQuery)),
    );
  }, [messages, query]);

  const stats = useMemo(() => {
    return [
      { label: "Unread messages", value: messages.filter((message) => message.status === "new").length },
      { label: "Inbox entries", value: messages.length },
      { label: "Phone lines", value: contactDetails.phones.filter(Boolean).length },
    ];
  }, [contactDetails.phones, messages]);

  const updateContactField = (field, value) => {
    setContactDetails((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const updateSocialField = (field, value) => {
    setContactDetails((current) => ({
      ...current,
      socials: {
        ...current.socials,
        [field]: value,
      },
    }));
  };

  const updatePhone = (index, value) => {
    setContactDetails((current) => ({
      ...current,
      phones: current.phones.map((phone, currentIndex) => (currentIndex === index ? value : phone)),
    }));
  };

  const addPhone = () => {
    setContactDetails((current) => ({
      ...current,
      phones: [...current.phones, ""],
    }));
  };

  const removePhone = (index) => {
    setContactDetails((current) => ({
      ...current,
      phones: current.phones.filter((_, currentIndex) => currentIndex !== index),
    }));
  };

  const updateAdditionalPlatform = (platformId, field, value) => {
    setContactDetails((current) => ({
      ...current,
      additionalPlatforms: current.additionalPlatforms.map((platform) =>
        platform.id === platformId ? { ...platform, [field]: value } : platform,
      ),
    }));
  };

  const addAdditionalPlatform = () => {
    setContactDetails((current) => ({
      ...current,
      additionalPlatforms: [...current.additionalPlatforms, createEmptyPlatform()],
    }));
  };

  const removeAdditionalPlatform = (platformId) => {
    setContactDetails((current) => ({
      ...current,
      additionalPlatforms: current.additionalPlatforms.filter((platform) => platform.id !== platformId),
    }));
  };

  const handleSaveContactDetails = (event) => {
    event.preventDefault();
    setFeedback(null);

    startTransition(async () => {
      const result = await saveContactDetailsAction({
        ...contactDetails,
        phones: contactDetails.phones.filter((phone) => phone.trim()),
        additionalPlatforms: contactDetails.additionalPlatforms.filter(
          (platform) => platform.platform.trim() || platform.url.trim(),
        ),
      });

      if (!result.ok) {
        setFeedback({ type: "error", message: result.message });
        return;
      }

      setContactDetails(normalizeContactDetails(result.item));
      setFeedback({ type: "success", message: result.message });
    });
  };

  const handleDeleteMessage = (message) => {
    if (!window.confirm(`Delete message from ${message.name}?`)) {
      return;
    }

    startTransition(async () => {
      const result = await deleteContentItem({ entityKey: "messages", id: message.id });
      setMessages((current) => current.filter((item) => item.id !== message.id));
      if (selectedMessage?.id === message.id) {
        setSelectedMessage(null);
      }
      setFeedback({ type: "success", message: result.message });
    });
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-display text-3xl font-semibold text-accent-deep-blue">Contact</h1>
            <p className="mt-2 max-w-3xl text-sm text-text-secondary">
              Update the official company contact details and manage messages submitted through the website contact form.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {stats.map((stat) => (
            <Card key={stat.label} className="overflow-hidden border-border-subtle/60">
              <CardContent className="p-5">
                <p className="text-sm text-text-secondary">{stat.label}</p>
                <p className="mt-3 font-display text-2xl font-semibold text-on-surface">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <FeedbackBanner feedback={feedback} />

        <div className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-surface-alt/70 p-1">
          <TabButton active={activeTab === "details"} onClick={() => setActiveTab("details")}>
            Contact Details
          </TabButton>
          <TabButton active={activeTab === "messages"} onClick={() => setActiveTab("messages")}>
            Messages
          </TabButton>
        </div>

        {activeTab === "details" ? (
          <Card className="overflow-hidden">
            <CardHeader className="border-b border-border-subtle bg-surface-main/80">
              <CardTitle>Official Contact Details</CardTitle>
              <CardDescription>
                Maintain the address, map embed link, phone numbers, email, and social links used on the website contact page.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6 sm:p-8">
              <form onSubmit={handleSaveContactDetails} className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
                  <div className="space-y-5">
                    <label className="block space-y-2">
                      <span className="text-sm font-medium text-on-surface">Address</span>
                      <Textarea
                        value={contactDetails.address}
                        onChange={(event) => updateContactField("address", event.target.value)}
                        placeholder="Enter company address"
                        className="min-h-36"
                      />
                    </label>

                    <label className="block space-y-2">
                      <span className="text-sm font-medium text-on-surface">Google Map Embed Link</span>
                      <Input
                        value={contactDetails.mapEmbedUrl}
                        onChange={(event) => updateContactField("mapEmbedUrl", event.target.value)}
                        placeholder="Paste the Google Maps iframe embed URL"
                        className="h-11"
                      />
                    </label>

                    <label className="block space-y-2">
                      <span className="text-sm font-medium text-on-surface">Email Address</span>
                      <Input
                        value={contactDetails.email}
                        onChange={(event) => updateContactField("email", event.target.value)}
                        placeholder="Enter contact email"
                        className="h-11"
                      />
                    </label>

                    <div className="rounded-3xl border border-border-subtle bg-surface-alt/40 p-5">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-lg font-display font-semibold text-on-surface">Telephone Number(s)</p>
                          <p className="mt-1 text-sm text-text-secondary">Add one or more contact phone lines.</p>
                        </div>
                        <Button type="button" size="sm" onClick={addPhone}>
                          <Plus size={14} />
                          Add Phone
                        </Button>
                      </div>

                      <div className="mt-5 space-y-3">
                        {contactDetails.phones.map((phone, index) => (
                          <div key={`${index}-${phone}`} className="flex items-center gap-3">
                            <Input
                              value={phone}
                              onChange={(event) => updatePhone(index, event.target.value)}
                              placeholder="Enter phone number"
                              className="h-11"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="gap-2 text-error hover:bg-error/10 hover:text-error"
                              onClick={() => removePhone(index)}
                              disabled={contactDetails.phones.length === 1}
                            >
                              <Trash2 size={14} />
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="rounded-3xl border border-border-subtle bg-surface-alt/40 p-5">
                      <p className="text-lg font-display font-semibold text-on-surface">Social Media Links</p>
                      <div className="mt-5 space-y-4">
                        <label className="block space-y-2">
                          <span className="text-sm font-medium text-on-surface">Facebook</span>
                          <Input
                            value={contactDetails.socials.facebook}
                            onChange={(event) => updateSocialField("facebook", event.target.value)}
                            placeholder="Facebook URL"
                            className="h-11"
                          />
                        </label>
                        <label className="block space-y-2">
                          <span className="text-sm font-medium text-on-surface">Instagram</span>
                          <Input
                            value={contactDetails.socials.instagram}
                            onChange={(event) => updateSocialField("instagram", event.target.value)}
                            placeholder="Instagram URL"
                            className="h-11"
                          />
                        </label>
                        <label className="block space-y-2">
                          <span className="text-sm font-medium text-on-surface">Twitter / X</span>
                          <Input
                            value={contactDetails.socials.twitter}
                            onChange={(event) => updateSocialField("twitter", event.target.value)}
                            placeholder="Twitter / X URL"
                            className="h-11"
                          />
                        </label>
                        <label className="block space-y-2">
                          <span className="text-sm font-medium text-on-surface">LinkedIn</span>
                          <Input
                            value={contactDetails.socials.linkedin}
                            onChange={(event) => updateSocialField("linkedin", event.target.value)}
                            placeholder="LinkedIn URL"
                            className="h-11"
                          />
                        </label>
                      </div>
                    </div>

                    <div className="rounded-3xl border border-border-subtle bg-surface-alt/40 p-5">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-lg font-display font-semibold text-on-surface">Additional Platforms</p>
                          <p className="mt-1 text-sm text-text-secondary">
                            Add any other social or directory links.
                          </p>
                        </div>
                        <Button type="button" size="sm" onClick={addAdditionalPlatform}>
                          <Plus size={14} />
                          Add Platform
                        </Button>
                      </div>

                      <div className="mt-5 space-y-4">
                        {contactDetails.additionalPlatforms.length === 0 ? (
                          <div className="rounded-2xl border border-dashed border-border-subtle bg-surface-main px-4 py-6 text-center text-sm text-text-secondary">
                            No extra platforms added yet.
                          </div>
                        ) : null}

                        {contactDetails.additionalPlatforms.map((platform) => (
                          <div key={platform.id} className="rounded-2xl border border-border-subtle bg-surface-main p-4">
                            <div className="mb-3 flex items-center justify-between gap-3">
                              <p className="text-sm font-semibold text-on-surface">Platform</p>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="gap-2 text-error hover:bg-error/10 hover:text-error"
                                onClick={() => removeAdditionalPlatform(platform.id)}
                              >
                                <Trash2 size={14} />
                                Remove
                              </Button>
                            </div>

                            <div className="space-y-3">
                              <Input
                                value={platform.platform}
                                onChange={(event) => updateAdditionalPlatform(platform.id, "platform", event.target.value)}
                                placeholder="Platform name"
                                className="h-11"
                              />
                              <Input
                                value={platform.url}
                                onChange={(event) => updateAdditionalPlatform(platform.id, "url", event.target.value)}
                                placeholder="Platform URL"
                                className="h-11"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end border-t border-border-subtle pt-5">
                  <Button type="submit" className="gap-2" disabled={isPending}>
                    <Save size={16} />
                    {isPending ? "Saving..." : "Save Contact Details"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <CardHeader className="border-b border-border-subtle bg-surface-main/80">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <CardTitle>Messages Inbox</CardTitle>
                  <CardDescription>
                    Review submissions from the contact form, open the full message, and remove old entries.
                  </CardDescription>
                </div>
                <div className="relative w-full lg:w-[360px]">
                  <Search
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary"
                  />
                  <Input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search messages"
                    className="h-11 pl-11"
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {filteredMessages.length === 0 ? (
                <div className="m-6 rounded-3xl border border-dashed border-border-subtle bg-surface-alt/50 px-6 py-12 text-center text-sm text-text-secondary">
                  No messages matched your search.
                </div>
              ) : (
                <Table className="min-w-[980px]">
                  <TableHeader>
                    <TableRow className="bg-surface-alt/50 hover:bg-surface-alt/50">
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone Number</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Date Submitted</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMessages.map((message) => (
                      <TableRow
                        key={message.id}
                        className={cn(message.status === "new" && "bg-accent-deep-blue/[0.04]")}
                      >
                        <TableCell className="font-medium text-on-surface">{message.name}</TableCell>
                        <TableCell>{message.email || "Not provided"}</TableCell>
                        <TableCell>{message.phone || "Not provided"}</TableCell>
                        <TableCell>{message.subject || "No subject"}</TableCell>
                        <TableCell>
                          <div className="max-w-[280px] truncate text-text-secondary">
                            {message.preview || message.body || "No message content"}
                          </div>
                        </TableCell>
                        <TableCell>{message.date || formatDateTime(message.updatedAt)}</TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              className="gap-2"
                              onClick={() => setSelectedMessage(message)}
                            >
                              <Eye size={14} />
                              View
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="gap-2 text-error hover:bg-error/10 hover:text-error"
                              onClick={() => handleDeleteMessage(message)}
                              disabled={isPending}
                            >
                              <Trash2 size={14} />
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {selectedMessage ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-surface-alt/90 px-4 py-8 backdrop-blur-sm">
          <div className="mx-auto flex min-h-full w-full max-w-3xl items-center">
            <Card className="w-full overflow-hidden border-accent-deep-blue/15 shadow-architectural">
              <CardHeader className="border-b border-border-subtle bg-surface-main/95">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <CardTitle className="text-2xl text-accent-deep-blue">{selectedMessage.subject || "Contact Message"}</CardTitle>
                    <CardDescription className="mt-2">
                      From {selectedMessage.name} • {selectedMessage.email || "No email"} • {selectedMessage.date || formatDateTime(selectedMessage.updatedAt)}
                    </CardDescription>
                  </div>
                  <Button type="button" variant="ghost" size="icon" onClick={() => setSelectedMessage(null)} title="Close message">
                    <X size={18} />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-5 p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-surface-alt/50 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary">Name</p>
                    <p className="mt-2 text-on-surface">{selectedMessage.name}</p>
                  </div>
                  <div className="rounded-2xl bg-surface-alt/50 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary">Phone Number</p>
                    <p className="mt-2 text-on-surface">{selectedMessage.phone || "Not provided"}</p>
                  </div>
                </div>

                <div className="rounded-3xl border border-border-subtle bg-surface-alt/40 p-5">
                  <p className="text-sm font-medium text-on-surface">Message</p>
                  <p className="mt-3 whitespace-pre-line text-sm leading-7 text-text-secondary">
                    {selectedMessage.body || selectedMessage.preview || "No message content"}
                  </p>
                </div>

                <div className="flex justify-end gap-3">
                  <Button type="button" variant="ghost" onClick={() => setSelectedMessage(null)}>
                    Close
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null}
    </>
  );
}
