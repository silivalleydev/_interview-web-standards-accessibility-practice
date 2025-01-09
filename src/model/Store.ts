import { observable } from "mobx";
import { get } from 'lodash';

export class Store{

    @observable store;

    constructor(store){
        this.store = store;
    }

    get name(){
        return this.store.name;
    }

    get address(){
        return this.store.location.address;
    }

    get bizKind(){
        return get(this.store, 'bizKind', '') + '-' + get(this.store, 'bizSubKind', '');
    }
}