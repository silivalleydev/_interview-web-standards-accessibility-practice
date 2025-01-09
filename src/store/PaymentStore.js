import { observable, action, set } from 'mobx';

class PaymentStore {
    exportData = observable([]);
    selectedPayments = observable({});

    @action setExportData = data => this.exportData = data;

    @action setSelectedPayment = (index, value) => set(this.selectedPayments, `${index}`, value);

    get ifAnyPaymentGotChecked(){
        return 0;
    }
}

export default new PaymentStore();