import { trim } from '@/utils/trim'
import { parse } from 'date-fns'

export class Transaction {
  constructor(row) {
    this.date = parse(trim(row.data[5]), 'dd/LL/yyyy', new Date())
    this.currency = trim(row.data[7])
    this.amount = trim(row.data[8])
    this.balance = trim(row.data[9])
    this.credit = trim(row.data[10])
    this.debit = trim(row.data[11])
    this.other_account = trim(row.data[12])
    this.other_name = trim(row.data[14])
    this.structured_comment = trim(row.data[16])
    this.free_comment = trim(row.data[17])
  }
}
