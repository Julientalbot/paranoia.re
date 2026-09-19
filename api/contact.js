import { createContactHandler } from '../lib/contact-handler.mjs';
export default createContactHandler({
  labels: { pilote: ['Votre usage', 'Assistant ou outil utilisé', 'Contrainte'] },
  from: 'Paranoia — site <site@send.paranoia.re>',
  to: ['contact@paranoia.re', 'julien.talbot@ergonomia.re'],
  subject: '[Paranoia]',
});
