import { defineStore } from 'pinia';
import { format } from "date-fns";

export const useMailsStore = defineStore('mails', {
  state: () => ({
    mails: {
      data: [],
      updatedAt: null,
    },
  }),
  actions: {
    setMails(mails) {
      this.mails.data = mails;
      this.mails.updatedAt = format(new Date(), 'dd-MM-yyyy HH:mm');
      console.log('Set date', this.mails.updatedAt)
    },
  },
});
