// ============================= general voids
function BMKformatNumber(number) {
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


class DisplayFilterValue{
    constructor({
        $singleDom = null, // use jquery selector
        $min_dom = null, // use jquery selector
        $max_dom = null, // use jquery selector
        $show_value_dom = null, // use jquery selector
        value_type = null, // options "price", "nearby"
    } = {} ){
        this.$min_dom = $min_dom;
        this.$max_dom = $max_dom;
        this.$show_value_dom = $show_value_dom;
        this.value_type = value_type;
        this.$singleDom = $singleDom
    };

    select_field(){
        if(this.$singleDom){
            this.show_single_vlalue()
            return
        };

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
        };

        this.show_select_value();
    };

    show_select_value(){
        var d_min_value = this.$min_dom.val();
        var d_max_value = this.$max_dom.val();

        if(this.value_type == "price"){
            d_min_value = BMKformatNumber(d_min_value)
            d_max_value = BMKformatNumber(d_max_value)
        };

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


    show_single_vlalue(){
        if(this.value_type == "nearby"){
            if(['', 'null', 'undefined', null, undefined].includes(this.$singleDom.val())){
                this.$show_value_dom.html(this.$show_value_dom.attr('filter-label-name'))
                return
            };

            this.$show_value_dom.html(this.$singleDom.val()+ ' km')
        };
    };

    select_button_display(){
        console.log(this.$singleDom)
    };
};




class FilterData{
    constructor({
        // ===== property type
        building__type = '', // value "residence" or "commercial"
        building__sub_type = [], // vlaue residence = ['condo', 'single_house', 'townhouse', 'apartment'] and commercial = ['sales_area', 'office', 'warehouse_factory']
        
        // ===== price
        min_price = null,
        max_price = null,
        // ===== bedroom
        min_number_of_bedroom = null,
        max_number_of_bedroom = null,
        // ===== unit area
        min_unit_area = null,
        max_unit_area = null,
        // ===== 
        number_of_bathroom = null,
        building__have_freehold = false,
        building__have_leasehold = false,
        building__quota = null,
        building__furnishing = null,
        building__status = null,
        nearby = null,
    } = {}){
        // ===== property type
        this.building__type = building__type;
        this.building__sub_type = building__sub_type;
        // ===== price
        this.min_price = min_price;
        this.max_price = max_price;
        // ===== bedroom
        this.min_number_of_bedroom = min_number_of_bedroom;
        this.max_number_of_bedroom = max_number_of_bedroom;
        // ===== unit area
        this.min_unit_area = min_unit_area;
        this.max_unit_area = max_unit_area;
        // ===== bathroom
        this.number_of_bathroom = number_of_bathroom;
        this.building__have_freehold = building__have_freehold;
        this.building__have_leasehold = building__have_leasehold;
        this.building__quota = building__quota;
        this.building__furnishing = building__furnishing;
        this.building__status = building__status;
        this.nearby = nearby,


        this.default_value();
    };


    // managing dom =====================
    display_showing(key){
        if([null, undefined].includes(key)) {
            throw new Error("key name not showing")
            return;
        };

        var init_option = {
            $singleDom : null,
            $min_dom : null,
            $max_dom : null,
            $show_value_dom : null,
        };

        switch (true) {
            case ["nearby"].includes(key):
                init_option.$singleDom = $('[name="nearby"]')
                init_option.$show_value_dom = $('[filter-label-name="Radius"]')
                init_option.value_type = "nearby"
                break;
            case ["min_price", "max_price"].includes(key):
                init_option.$min_dom = $('[name="min_price"]')
                init_option.$max_dom = $('[name="max_price"]')
                init_option.$show_value_dom = $('[filter-label-name="Price"]')
                init_option.value_type = "price"
                break;
            case ["min_number_of_bedroom", "max_number_of_bedroom"].includes(key):
                init_option.$min_dom = $('[name="min_number_of_bedroom"]')
                init_option.$max_dom = $('[name="max_number_of_bedroom"]')
                init_option.$show_value_dom = $('[filter-label-name="Bedrooms"]')
                break;
        };

        if( 
            init_option.$min_dom || 
            init_option.$max_dom ||
            init_option.$singleDom
        ) new DisplayFilterValue(init_option).select_field()
    };
    

    default_value(){
        var $this = this;
        var has_value_obj = this.only_has_value();

        Object.entries(has_value_obj).forEach(function([key, value]){
            if(key == "building__type") {
                $('[building-type-status]').attr('building-type-status', value)
                return
            };
            if(key == "building__sub_type"){
                var checkbox_list = $('[name="building__sub_type"]');

                for (let i = 0; i < checkbox_list.length; i++) {
                    var is_exist = value.includes(checkbox_list[i].value);
                    checkbox_list[i].checked = is_exist;
                };

                return
            };
            $('[name="'+key+'"]').val(value); // this part must be call 
            $this.display_showing(key); // this part must be call affter set the input value
        });
    };
    

    set_value(key, value){
        if(["", null, undefined].includes(key)){
            throw new Error("Params not set for key, value")
            return;
        };
        this[key] = value;
        this.display_showing(key);
    };


    select_vai_button(key, value){
        if(["", null, undefined].includes(key)){
            throw new Error("Params not set for key, value")
            return;
        };

        if(this[key] == null){
            this[key] = value;
            return true
        };
        var $value_status = this[key] == value;
        this[key] = !$value_status ? value : null;
        return !$value_status;
    };


    free_lease_hold_toggle_data(key){
        if(key == "building__have_freehold"){
            this.building__have_leasehold = false
        };

        if(key == "building__have_leasehold"){
            this.building__have_freehold = false
        };

        this[key] = !this[key];
        return this[key];
    };

    
    // ============================= property type start
    building_type_void(){
        $('[building-type-status]').attr('building-type-status', this.building__type);
        $('[type-area-name="'+this.building__type+'"] input').prop('checked', false);
        this.building__sub_type = [];
    };

    building_sub_type_void(value){
        if(this.building__type == "residence"){
            this.building__sub_type = [value];
            return
        };

        // for commercial
        var get_index = this.building__sub_type.indexOf(value);
        if(get_index == -1){
            this.building__sub_type.push(value)
        }else{
            this.building__sub_type.splice(get_index, 1);
        };
    };

    // ============================= property type end

    
    // clear voids
    reset_dom_value(){
        var $this = this;
        var empty_value_obj = this.only_empty_value();
        var button_type = [
            "building__furnishing", 
            "building__quota", 
            "building__have_freehold", 
            "building__have_leasehold", 
            "building__status"
        ]

        Object.entries(empty_value_obj).forEach(function([key, value]){
            if(key == "building__type") {
                $('[building-type-status]').attr('building-type-status', "residence")
                return;
            };

            if(key == "building__sub_type"){
                $('[name="building__sub_type"]').prop('checked', false);
                return;
            };

            if(button_type.includes(key)){
                $('[name="'+key+'"]').attr("active", false);
                return;
            };

            $('[name="'+key+'"]').val(value); // this part must be call 
            $this.display_showing(key); // this part must be call affter set the input value
        });
    };

    clear_building_type(){
        this.building__type = '';
        this.building__sub_type = [];
        this.reset_dom_value();
    };

    clear_price(){
        this.max_price = null;
        this.min_price = null;
        this.reset_dom_value();
    };

    clear_bedroom(){
        this.max_number_of_bedroom = null;
        this.min_number_of_bedroom = null;
        this.reset_dom_value();
    };

    clear_all(){
        for (let key in this) this[key] = null;
        
        // ===== property type
        this.building__type = "";
        this.building__sub_type = [];
        this.building__have_freehold = false;
        this.building__have_leasehold = false;

        this.reset_dom_value();
    };


    // general voids
    only_has_value(){
        var result = {};
        for (let key in this) {
            if (
                this[key] != "" && 
                this[key] != null && 
                this[key] != undefined && 
                this[key] != "null" &&
                this[key] != false &&
                !(Array.isArray(this[key]) && this[key].length === 0)
            ) {
                result[key] = this[key];
            }
        };
        return result;
    };

    only_empty_value() {
        const result =  {};
        for (let key in this) {
            if (
                this[key] == '' ||
                this[key] == null ||
                this[key] == undefined ||
                this[key] == false ||
                (Array.isArray(this[key]) && this[key].length == 0)
            ) {
                result[key] = this[key];
            }
        }
        return result;
    }
    
};