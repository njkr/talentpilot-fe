"use client";

import { useState } from "react";
import { CheckCircleIcon, InboxIcon } from "@heroicons/react/24/outline";
import { H1, H2, H3, Body, Caption } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { TooltipProvider, Tooltip } from "@/components/ui/tooltip";
import { Tabs } from "@/components/ui/tabs";
import { Popover } from "@/components/ui/popover";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { Modal } from "@/components/ui/modal";
import { toast } from "@/components/ui/toast";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Progress } from "@/components/ui/progress";
import { Divider } from "@/components/ui/divider";
import { FadeIn, SlideUp, Collapse } from "@/components/motion";

export default function KitPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [checked, setChecked] = useState(false);
  const [collapseOpen, setCollapseOpen] = useState(false);

  return (
    <TooltipProvider>
      <div className="mx-auto max-w-4xl p-8 space-y-12">
        <FadeIn>
          <H1>Component Kit</H1>
          <Body className="mt-1">Every Sprint 0 primitive in every state — the Definition of Done for the foundation.</Body>
        </FadeIn>

        <section>
          <H2>Typography</H2>
          <div className="mt-4 space-y-2">
            <H1>Heading 1</H1>
            <H2>Heading 2</H2>
            <H3>Heading 3</H3>
            <Body>Body text — ink-secondary, the default for paragraph copy.</Body>
            <Caption>Caption text — ink-muted, large/decorative use only.</Caption>
          </div>
        </section>

        <Divider />

        <section>
          <H2>Buttons</H2>
          <div className="flex flex-wrap gap-3 mt-4">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button loading>Loading</Button>
            <Button disabled>Disabled</Button>
            <Button size="sm">Small</Button>
            <Button size="lg">Large</Button>
          </div>
        </section>

        <section>
          <H2>Inputs</H2>
          <div className="grid grid-cols-2 gap-4 mt-4 max-w-xl">
            <Input label="Email" placeholder="you@example.com" />
            <Input label="Password" type="password" error="Must be at least 8 characters" />
            <Input label="Disabled" disabled placeholder="Can't touch this" />
            <Input label="With helper" placeholder="jordan" helper="This is your public handle" />
          </div>
          <div className="mt-4 max-w-xl">
            <Textarea label="Message" placeholder="Paste a job description..." />
          </div>
        </section>

        <section>
          <H2>Badges</H2>
          <div className="flex flex-wrap gap-2 mt-4">
            <Badge tone="neutral">Neutral</Badge>
            <Badge tone="success">Matched</Badge>
            <Badge tone="warning">Partial</Badge>
            <Badge tone="danger">Missing</Badge>
            <Badge tone="primary">Primary</Badge>
          </div>
        </section>

        <section>
          <H2>Cards</H2>
          <SlideUp className="mt-4 max-w-sm">
            <Card>
              <H3>Card title</H3>
              <Body className="mt-1">bg-card, border-border, rounded-xl, shadow-sm — the exact spec.</Body>
            </Card>
          </SlideUp>
        </section>

        <section>
          <H2>Avatar</H2>
          <div className="flex gap-3 mt-4 items-center">
            <Avatar name="Jordan Ellis" />
            <Avatar name="Ada Lovelace" />
          </div>
        </section>

        <section>
          <H2>Select &amp; Checkbox</H2>
          <div className="flex flex-wrap gap-6 mt-4 items-end">
            <Select
              label="Seniority"
              placeholder="Choose one"
              options={[
                { value: "junior", label: "Junior" },
                { value: "mid", label: "Mid" },
                { value: "senior", label: "Senior" },
              ]}
            />
            <Checkbox id="kit-checkbox" label="Accept suggestion" checked={checked} onCheckedChange={setChecked} />
          </div>
        </section>

        <section>
          <H2>Tooltip, Popover &amp; Dropdown</H2>
          <div className="flex flex-wrap gap-4 mt-4 items-center">
            <Tooltip content="Refunds happen automatically on failure">
              <Button variant="secondary" size="sm">
                Hover me
              </Button>
            </Tooltip>
            <Popover trigger={<Button variant="secondary" size="sm">Open popover</Button>}>
              <Body>Notification-style panel content goes here.</Body>
            </Popover>
            <DropdownMenu
              trigger={<Button variant="secondary" size="sm">Open menu</Button>}
              items={[
                { label: "Profile", onSelect: () => toast("Profile clicked") },
                { label: "Sign out", onSelect: () => toast("Sign out clicked", "warning"), danger: true },
              ]}
            />
          </div>
        </section>

        <section>
          <H2>Tabs</H2>
          <div className="mt-4">
            <Tabs
              items={[
                { value: "score", label: "Score", content: <Body>Score breakdown content.</Body> },
                { value: "keywords", label: "Keywords", content: <Body>Keyword table content.</Body> },
                { value: "suggestions", label: "Suggestions", content: <Body>Suggestions review content.</Body> },
              ]}
            />
          </div>
        </section>

        <section>
          <H2>Modal</H2>
          <div className="mt-4">
            <Button onClick={() => setModalOpen(true)}>Open modal</Button>
            <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Upgrade required">
              <Body>You&apos;ve reached your plan limit. This is the shared upgrade modal pattern.</Body>
              <div className="mt-4 flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setModalOpen(false)}>Upgrade</Button>
              </div>
            </Modal>
          </div>
        </section>

        <section>
          <H2>Toast</H2>
          <div className="flex flex-wrap gap-3 mt-4">
            <Button variant="secondary" onClick={() => toast("Version 2 created", "success")}>
              Success toast
            </Button>
            <Button variant="secondary" onClick={() => toast("Slow down — retry in 30s", "warning")}>
              Warning toast
            </Button>
            <Button variant="secondary" onClick={() => toast("Something went wrong", "error")}>
              Error toast
            </Button>
          </div>
        </section>

        <section>
          <H2>Loading &amp; empty states</H2>
          <div className="flex flex-wrap items-center gap-6 mt-4">
            <Spinner className="h-6 w-6 text-primary" />
            <div className="space-y-2 w-48">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
          <Card className="mt-4">
            <EmptyState
              icon={InboxIcon}
              title="No resumes yet"
              description="Upload a resume to get started with tailored suggestions."
              action={{ label: "Upload resume", onClick: () => toast("Upload clicked") }}
            />
          </Card>
        </section>

        <section>
          <H2>Progress</H2>
          <div className="mt-4 max-w-sm space-y-2">
            <Progress value={65} />
            <Caption>65 / 100 — weighted pipeline progress, not a step count.</Caption>
          </div>
        </section>

        <section>
          <H2>Motion</H2>
          <div className="mt-4">
            <Button variant="secondary" size="sm" onClick={() => setCollapseOpen((v) => !v)}>
              Toggle collapse
            </Button>
            <Collapse open={collapseOpen} className="mt-2">
              <Card>
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="h-5 w-5 text-success" />
                  <Body>Respects prefers-reduced-motion.</Body>
                </div>
              </Card>
            </Collapse>
          </div>
        </section>
      </div>
    </TooltipProvider>
  );
}
