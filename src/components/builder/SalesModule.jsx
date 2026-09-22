import React from 'react';
import { Field, Card, Note } from './builderKit';

// Module 05 — SALES: first-customer sales kit, tone adapted to sales comfort
// server-side. No deceptive urgency, no spam.
export default function SalesModule({ content }) {
  return (
    <div>
      <Card>
        <Field label="SHORT INTRODUCTION">{content.introduction}</Field>
      </Card>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Card>
          <Field label="DM / TEXT SCRIPT">{content.dm_script}</Field>
        </Card>
        <Card>
          <Field label="EMAIL SCRIPT">{content.email_script}</Field>
        </Card>
      </div>
      {content.in_person_script && (
        <Card>
          <Field label="IN-PERSON SCRIPT">{content.in_person_script}</Field>
        </Card>
      )}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Card>
          <Field label="FOLLOW-UP #1">{content.follow_up_1}</Field>
        </Card>
        <Card>
          <Field label="FOLLOW-UP #2">{content.follow_up_2}</Field>
        </Card>
      </div>
      <Card>
        <div className="space-y-3">
          <Field label="COMMON OBJECTION">{content.common_objection}</Field>
          <Field label="RESPONSE">{content.objection_response}</Field>
        </div>
      </Card>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Card>
          <Field label="SOFT CLOSE">{content.soft_close}</Field>
        </Card>
        <Card>
          <Field label="CALL TO ACTION">{content.call_to_action}</Field>
        </Card>
      </div>
      <Note>
        Scripts are starting points for honest one-to-one conversations — never mass messaging, never fake urgency.
      </Note>
    </div>
  );
}