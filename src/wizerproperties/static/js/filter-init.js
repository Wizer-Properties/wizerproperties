class FilterInit{
    constructor({
        $min_dom = null, // use jquery selector
        $max_dom = null, // use jquery selector
        $show_value_dom = null, // use jquery selector
        value_type = "price", // display value with format 
        min_default_value = null, // default value that set into inputs but do not use it for on change
        max_default_value = null, // default value that set into inputs but do not use it for on change

        // ========= for property type only ======= start
        $building_checkboxs = null, // checkbox dom
        building__type = null, // value "residence" or "commercial"
        building__sub_type = [], // vlaue residence = ['condo', 'single_house', 'townhouse', 'apartment'] and commercial = ['sales_area', 'office', 'warehouse_factory']
        // ========= for property type only ======= end

    }){
        this.$min_dom = $min_dom;
        this.$max_dom = $max_dom;
        this.$show_value_dom = $show_value_dom;
        this.value_type = value_type;
        this.min_default_value = min_default_value;
        this.max_default_value = max_default_value;

        this.building__type = building__type;
        this.building__sub_type = building__sub_type;
        this.$building_checkboxs = $building_checkboxs;

        if(
            !this.building__type &&
            this.min_default_value &&
            this.max_default_value
        ) this.default_value();
    };


    default_value(){
        this.$min_dom.val(this.min_default_value);
        this.$max_dom.val(this.max_default_value);
        this.select_field();
    };


    select_field(){
        var sub_options_min = this.$min_dom.find('option');
        var sub_options_max = this.$max_dom.find('option');

        if(sub_options_min.length != sub_options_max.length){
            alert("Option area not same.")
            return
        };
        
        sub_options_min.prop("disabled", false);
        sub_options_max.prop("disabled", false);

        for (let i = 0; i < sub_options_min.length; i++) {
            sub_options_max[i].disabled = true;
            if(sub_options_min[i].getAttribute('value') == this.$min_dom.val()) break;
        };
        
        if(!['', 'null', 'undefined', null, undefined].includes(this.$max_dom.val())){
            for (let i = sub_options_max.length -1 ; i >= 0 ; i--) {
                sub_options_min[i].disabled = true;
                if(sub_options_max[i].getAttribute('value') == this.$max_dom.val()) break;
            };
        }

        if(this.$show_value_dom) this.show_select_value();
    };


    show_select_value(){
        var d_min_value = this.$min_dom.val();
        var d_max_value = this.$max_dom.val();

        if(this.value_type == "price"){
            d_min_value = this.BMKformatNumber(d_min_value)
            d_max_value = this.BMKformatNumber(d_max_value)
        }

        if(
            !['', 'null', 'undefined', null, undefined].includes(this.$min_dom.val()) &&
            !['', 'null', 'undefined', null, undefined].includes(this.$max_dom.val())
        ){
            this.$show_value_dom.html(d_min_value +' - '+ d_max_value)
            return
        };

        if(
            ['', 'null', 'undefined', null, undefined].includes(this.$min_dom.val()) &&
            ['', 'null', 'undefined', null, undefined].includes(this.$max_dom.val())
        ){
            this.$show_value_dom.html(this.$show_value_dom.attr('filter-label-name') || "Set attribute 'filter-label-name'" )
            return
        };

        if(['', 'null', 'undefined', null, undefined].includes(this.$min_dom.val())){
            this.$show_value_dom.html('Min - '+ d_max_value)
        };

        if(['', 'null', 'undefined', null, undefined].includes(this.$max_dom.val())){
            this.$show_value_dom.html(d_min_value + ' - Max')
        };
    };


    BMKformatNumber(number) {
        if(
            Number(number) == NaN ||
            [null, undefined, ''].includes(number)
        ) return number;

        if (number >= 1000000000) {
            return (number / 1000000000).toFixed(1) + ' B';
        } else if (number >= 1000000) {
            return (number / 1000000).toFixed(1) + ' M';
        } else if (number >= 1000) {
            return (number / 1000).toFixed(1) + ' k';
        } else {
            return number.toString();
        };
    };


    building_type_void(){
        $('[building-type-status]').attr('building-type-status', this.building__type);
        $('[type-area-name="'+this.building__type+'"] input').prop('checked', false);
    };

    building_sub_type_void(){
        
        console.log("=====")
        // return this.building__sub_type;
    }
}