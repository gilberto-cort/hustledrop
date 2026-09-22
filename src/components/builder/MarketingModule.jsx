import React from 'react';
import { Field, Card, ListField, Note } from './builderKit';

// Module 06 — MARKETING: a small launch kit. Optional channel ideas render
// only when the generator judged them relevant (never filler).
export default function MarketingModule({ content }) {
  return (
    <div>
      <Card>
        <Field label="CORE MESSAGE">{content.core_message}</Field>
      </Card>
      <Card>
        <ListField label="3 SOCIAL POSTS" items={content.social_posts} />
      </Card>
      <Card>
        <ListField label="3 SHORT-FORM CONTENT IDEAS" items={content.short_form_ideas} />
      </Card>
      <Card>
        <Field label="1 SIMPLE PROMOTION">{content.simple_promotion}</Field>
      </Card>
      {(content.referral_idea || content.local_marketing_idea || content.online_marketing_idea) && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {content.referral_idea && (
            <Card>
              <Field label="REFERRAL IDEA">{content.referral_idea}</Field>
            </Card>
          )}
          {content.local_marketing_idea && (
            <Card>
              <Field label="LOCAL MARKETING IDEA">{content.local_marketing_idea}</Field>
            </Card>
          )}
          {content.online_marketing_idea && (
            <Card>
              <Field label="ONLINE MARKETING IDEA">{content.online_marketing_idea}</Field>
            </Card>
          )}
        </div>
      )}
      <Note>Only the channels that fit this business and your style — nothing included just to fill space.</Note>
    </div>
  );
}