import axios from 'redaxios'
import { produce } from 'immer'
import { actionDelayFn, loaderDelayFn, shuffle } from './utils'
import Database from '@tauri-apps/plugin-sql';
import { warn, debug, trace, info, error } from '@tauri-apps/plugin-log';


type PickAsRequired<TValue, TKey extends keyof TValue> = Omit<TValue, TKey> &
  Required<Pick<TValue, TKey>>

export type Buyer = {
  id: number,
  name: string
}

let buyers: Array<Buyer> = null!

const ensureBuyers = async () => {
    const db = await Database.load('sqlite:licitacija.db');
    const result = await db.select(`SELECT * from "buyers"`);
    info(JSON.stringify(result))
    buyers = result as Buyer[]
}

export async function fetchBuyers() {
  return loaderDelayFn(() => ensureBuyers().then(() => buyers))
}

export async function fetchBuyerById(id: number) {
  return loaderDelayFn(() =>
    ensureBuyers().then(() => {
      const invoice = buyers.find((d) => d.id === id)
      if (!invoice) {
        throw new Error('Buyer not found')
      }
      return invoice
    }),
  )
}

export async function postBuyer(partialBuyer: Partial<Buyer>) {
    if (partialBuyer.name?.includes('error')) {
      throw new Error('Ouch!')
    }

    const invoice = {
      name:
        partialBuyer.name ?? `New Buyer ${String(Date.now()).slice(0, 5)}`,
    }

    const db = await Database.load('sqlite:licitacija.db');
    const result = await db.execute(`INSERT INTO "buyers" ("name") values ($1)`, ["namey"]);

    return invoice
}

export async function patchBuyer({
  id,
  ...updatedBuyer
}: PickAsRequired<Partial<Buyer>, 'id'>) {
  return actionDelayFn(() => {
    buyers = produce(buyers, (draft) => {
      const invoice = draft.find((d) => d.id === id)
      if (!invoice) {
        throw new Error('Buyer not found.')
      }
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (updatedBuyer.name?.toLocaleLowerCase()?.includes('error')) {
        throw new Error('Ouch!')
      }
      Object.assign(invoice, updatedBuyer)
    })

    return buyers.find((d) => d.id === id)
  })
}
