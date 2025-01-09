import { observable, action, set } from 'mobx';
import { findIndex, values } from 'lodash';

class PaymentStore {
    exportData = observable([]);
    selectedPayments = observable({});

    @action setExportData = data => this.exportData = data;

    @action setSelectedPayment = (index, value) => set(this.selectedPayments, `${index}`, value);

    get ifAnyPaymentGotChecked(){
        return findIndex(values(this.selectedPayments), payment => payment === true) >= 0;
    }
}

export default new PaymentStore();