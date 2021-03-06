import { NumberUtils } from '../../Utils/NumberUtils';
import { TimeUtils } from '../../Utils/TimeUtils';
import { InputModel } from '../Abstract/InputModel';
export class TimeInputModel extends InputModel {
    constructor(json, parent, context) {
        super(json, parent, context);
        this.isValueValid = (value) => {
            let target = value !== undefined ? value : this.value;
            if (target && target.length !== 0) {
                let minTime = TimeUtils.extractTime(this.min);
                let maxTime = TimeUtils.extractTime(this.max);
                let time = TimeUtils.extractTime(target);
                return NumberUtils.isInRange(time, minTime, maxTime);
            }
            return true;
        };
        this.max = json.max;
        this.min = json.min;
        this.placeholder = json.placeholder;
        if (!this.value && !this.placeholder) {
            this.value = TimeUtils.getTimeString(new Date());
        }
        if (this.context.form) {
            this.context.form.registerListener(this.id, this.storeListener);
            this.onInput(this.value);
        }
    }
}
