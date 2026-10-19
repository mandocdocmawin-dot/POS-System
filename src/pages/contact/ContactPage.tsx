import { T } from "../../i18n/T";
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FeaturePage } from '../../components/common/FeaturePage';
import { TicketForm } from '../../components/help/TicketForm';
import { contactService } from '../../services/contactService';
export function Component() {
  const info = contactService.info(), [ticket, setTicket] = useState('');
  return <FeaturePage title="Contact Us" description="This form creates a local demo ticket. No message is sent outside your browser."><div className="grid gap-6 lg:grid-cols-2"><section className="card space-y-5"><h2 className="text-xl font-semibold"><T text={"How can we help?"}/></h2><p><T text={"From "}/>{info.name} · {info.email}</p>{ticket && <p role="status" className="rounded-lg bg-green-100 p-3 text-green-950">Ticket {ticket} created. <Link className="underline" to="/help-center">View in Help Center</Link></p>}<TicketForm source="contact" saved={t => setTicket(t.ticketNo)} /></section><div className="space-y-5"><section className="card space-y-3"><h2 className="text-xl font-semibold">{info.business.businessName}</h2><p>{info.business.address}</p>{info.business.email && <p><a className="underline" href={`mailto:${info.business.email}`}>{info.business.email}</a></p>}<p>{info.business.phone}</p></section>{info.branches.map(branch => <section className="card space-y-3" key={branch.id}><h2 className="text-lg font-semibold">{branch.name}</h2><p>{branch.address}{branch.city ? `, ${branch.city}` : ''}</p><p>{branch.phone}</p><details><summary className="cursor-pointer"><T text={"Opening hours"}/></summary><dl className="mt-3 grid grid-cols-2 gap-2">{Object.entries(branch.openingHours).map(([day, hours]) => <div className="contents" key={day}><dt className="capitalize">{day}</dt><dd>{!hours.open ? 'Closed' : `${hours.start} – ${hours.end}`}</dd></div>)}</dl></details></section>)}</div></div></FeaturePage>;
}
