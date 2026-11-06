import type { Contact, Profile, Site, Stack, Timeline } from '../../../content/schema';
import contactJson from '../../../data/contact.json';
import profileJson from '../../../data/profile.json';
import siteJson from '../../../data/site.json';
import stackJson from '../../../data/stack.json';
import timelineJson from '../../../data/timeline.json';

/**
 * Datos del sitio desde src/data/*.json. La forma se valida con Zod antes del build y la
 * chequea TypeScript al asignar cada JSON a su tipo.
 */
export const SITE: Site = siteJson;
export const PROFILE: Profile = profileJson;
export const CONTACT: Contact = contactJson;
export const STACK: Stack = stackJson;
export const TIMELINE: Timeline = timelineJson;
