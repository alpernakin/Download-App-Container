import { Error } from "mongoose";

export class DownloadService {
    constructor(model) {
        this.model = model;
        
        this.insert = this.insert.bind(this);
        this.update = this.update.bind(this);
        this.delete = this.delete.bind(this);
    }

    async insert(data) {
        try {
            let item = await this.model.create(data);
            // the item could not be inserted!!
            return !!item;
        } catch (error) {
            console.log("error", error);
            // TODO use logger to log errors!
            throw new Error("Not able to create the item");
        }
    }

    async update(id, data) {
        try {
            let item = await this.model.findByIdAndUpdate(id, data, { new: true });
            // the item could not be found!!
            return !!item;
        } catch (error) {
            console.log("error", error);
            // TODO use logger to log errors!
            throw new Error("Not able to update the item");
        }
    }

    async delete(id) {
        try {
            let item = await this.model.findByIdAndDelete(id);
            // the item could not be found!!
            return !!item;
        } catch (error) {
            console.log("error", error);
            // TODO use logger to log errors!
            throw new Error("Not able to delete the item");
        }
    }
}