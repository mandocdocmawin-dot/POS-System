import {Avatar} from '../common/Avatar';
import { useState } from 'react';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { useAction } from '../../hooks/useAction';
import { chatService } from '../../services/chatService';
import type { Conversation } from '../../types/phase8';
export function GroupEditor({ conversation, close, saved }: { conversation: Pick<Conversation, 'id' | 'name' | 'memberIds'>; close: () => void; saved: (id: string) => void }) {
  const [name, setName] = useState(conversation.name ?? ''), [members, setMembers] = useState(conversation.memberIds), [remove, setRemove] = useState(false), action = useAction();
  return <><Modal open title={conversation.id ? 'Manage group channel' : 'Create group channel'} onClose={close}>{action.feedback}<form className="space-y-4" onSubmit={e => { e.preventDefault(); void action.run(() => { let id = conversation.id; if (id) chatService.updateGroup(id, name, members); else id = chatService.create('group', members, name).id; saved(id); close(); }, 'Demo group saved'); }}><label className="grid gap-2">Unique channel name<input required value={name} onChange={e => setName(e.target.value)} /></label><fieldset className="grid gap-3"><legend className="mb-3">Members (at least two active staff)</legend>{chatService.people().map(person => <label className="flex items-center gap-2" key={person.id}><input type="checkbox" checked={members.includes(person.id)} onChange={e => setMembers(e.target.checked ? [...members, person.id] : members.filter(id => id !== person.id))} /><Avatar name={person.name} imageId={person.avatarId}/>{person.name}</label>)}</fieldset><button className="btn-primary" disabled={action.busy}>Save group</button>{conversation.id && <button className="btn ml-3" type="button" onClick={() => setRemove(true)}>Delete channel</button>}</form></Modal><ConfirmDialog open={remove} title="Delete group channel?" message="This deletes the local group and its messages. The system #general channel cannot be deleted." onClose={() => setRemove(false)} onConfirm={() => { chatService.removeGroup(conversation.id); close(); }} /></>;
}
