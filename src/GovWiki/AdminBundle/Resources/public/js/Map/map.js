Handlebars.registerHelper('ifCond', function(v1, v2, options) {
  if(v1 === v2) {
    return options.fn(this);
  }
  return options.inverse(this);
});


$(function() {
    var $addBtn = $('#condition-add');
    var $conditionList = $('#conditions-list');

    /*
        Add exists conditions.
     */
    window.gw.county.conditions.forEach(function(data) {
        var $element = $('<div>', { 'class': 'col-md-12 condition-row' });

        if ('simple' === data.type) {
            $element.html(Handlebars.templates.simple({
                idx: $conditionList.find('.condition-row').length,
                condition: {
                    value: data.value,
                    operation: data.operation,
                    color: data.color,
                    type: 'simple'
                }
            }));
        } else if ('period' === data.type) {
            $element.html(Handlebars.templates.period({
                idx: $conditionList.find('.condition-row').length,
                condition: {
                    min: data.min,
                    max: data.max,
                    color: data.color,
                    type: 'period'
                }
            }));
        } else {
            $element.html(Handlebars.templates.null({
                idx: $conditionList.find('.condition-row').length,
                condition: {
                    color: data.color,
                    type: 'null'
                }
            }));
        }

        $element.colorpicker({
            format: 'hex',
            align: 'left'
        });

        $conditionList.append($element);
    });

    /*
        Add new condition, by default use simple condition form.
     */
    $addBtn.click(function() {

        var $element = $('<div>', { 'class': 'col-md-12 condition-row' });

        $element.html(Handlebars.templates.simple({
            idx: $conditionList.find('.condition-row').length,
            condition: {
                value: 0,
                operation: '<=',
                type: 'simple'
            }
        }));

        $element.colorpicker({
            format: 'hex',
            align: 'left'
        });

        $conditionList.append($element);
    });

    /*
        Set remove callback.
     */
    $conditionList.on('click', '.condition-remove', function () {
        $(this).closest('.condition-row').remove();
    });

    /*
        Set type change callback.
     */
    $conditionList.on('change', '.condition-type', function() {
        var type = $(this).find(':selected').val();
        var data = '';

        if ('simple' === type) {
            data = Handlebars.templates.simple({
                idx: $conditionList.find('.condition-row').length,
                condition: {
                    value: 0,
                    operation: '<=',
                    color: '#000000',
                    type: 'simple'
                }
            });
        } else if ('period' === type) {
            data = Handlebars.templates.period({
                idx: $conditionList.find('.condition-row').length,
                condition: {
                    min: 0,
                    max: 1,
                    color: '#000000',
                    type: 'period'
                }
            });
        } else {
            data = Handlebars.templates.null({
                idx: $conditionList.find('.condition-row').length,
                condition: {
                    color: '#000000',
                    type: 'null'
                }
            });
        }

        var $row = $(this).closest('.condition-row');
        $row.html(data);

        $row.colorpicker({
            format: 'hex',
            align: 'left'
        });


        /*
         Initialize color pickers.
         */
        $('.color-picker').colorpicker({
            format: 'hex',
            align: 'left'
        });
    });

    /*
     Initialize color pickers.
     */
    $('.color-picker').colorpicker({
        format: 'hex',
        align: 'left'
    });
});


// simple.handlebars
!function(){var n=Handlebars.template,l=Handlebars.templates=Handlebars.templates||{};l.simple=n({1:function(n,l,o,a,i){return" selected"},compiler:[7,">= 4.0.0"],main:function(n,l,o,a,i){var e,d,t=null!=l?l:{},c=o.helperMissing,u="function",s=n.escapeExpression,p=n.lambda;return'\n<div class="form-group col-md-3 col-xs-12">\n    <label for="condition_'+s((d=null!=(d=o.idx||(null!=l?l.idx:l))?d:c,typeof d===u?d.call(t,{name:"idx",hash:{},data:i}):d))+'_value">Value</label>\n    <input class="form-control" id="condition_'+s((d=null!=(d=o.idx||(null!=l?l.idx:l))?d:c,typeof d===u?d.call(t,{name:"idx",hash:{},data:i}):d))+'_value" name="ccc[conditions]['+s((d=null!=(d=o.idx||(null!=l?l.idx:l))?d:c,typeof d===u?d.call(t,{name:"idx",hash:{},data:i}):d))+'][value]" value="'+s(p(null!=(e=null!=l?l.condition:l)?e.value:e,l))+'">\n</div>\n\n<div class="form-group col-md-3 col-xs-12">\n    <label for="condition_'+s((d=null!=(d=o.idx||(null!=l?l.idx:l))?d:c,typeof d===u?d.call(t,{name:"idx",hash:{},data:i}):d))+'_operation">Operation</label>\n    <select style="width: 80px" id="condition_'+s((d=null!=(d=o.idx||(null!=l?l.idx:l))?d:c,typeof d===u?d.call(t,{name:"idx",hash:{},data:i}):d))+'_operation" name="ccc[conditions]['+s((d=null!=(d=o.idx||(null!=l?l.idx:l))?d:c,typeof d===u?d.call(t,{name:"idx",hash:{},data:i}):d))+'][operation]">\n        <option value="<=" '+(null!=(e=(o.ifCond||l&&l.ifCond||c).call(t,null!=(e=null!=l?l.condition:l)?e.operation:e,"<=",{name:"ifCond",hash:{},fn:n.program(1,i,0),inverse:n.noop,data:i}))?e:"")+'><</option>\n        <option value=">=" '+(null!=(e=(o.ifCond||l&&l.ifCond||c).call(t,null!=(e=null!=l?l.condition:l)?e.operation:e,">=",{name:"ifCond",hash:{},fn:n.program(1,i,0),inverse:n.noop,data:i}))?e:"")+'>></option>\n    </select>\n</div>\n\n<div class="form-group col-md-3 col-xs-12">\n    <label for="condition_'+s((d=null!=(d=o.idx||(null!=l?l.idx:l))?d:c,typeof d===u?d.call(t,{name:"idx",hash:{},data:i}):d))+'_color">Color</label>\n\n    <div class="input-group color-picker colorpicker-element">\n        <span class="input-group-addon"><i></i></span>\n        <input type="text" id="condition_'+s((d=null!=(d=o.idx||(null!=l?l.idx:l))?d:c,typeof d===u?d.call(t,{name:"idx",hash:{},data:i}):d))+'_color" name="ccc[conditions]['+s((d=null!=(d=o.idx||(null!=l?l.idx:l))?d:c,typeof d===u?d.call(t,{name:"idx",hash:{},data:i}):d))+'][color]" required="required" class="form-control" value="'+s(p(null!=(e=null!=l?l.condition:l)?e.color:e,l))+'">\n    </div>\n</div>\n\n<div class="form-group col-md-3 col-xs-12">\n    <label for="condition_'+s((d=null!=(d=o.idx||(null!=l?l.idx:l))?d:c,typeof d===u?d.call(t,{name:"idx",hash:{},data:i}):d))+'_type">Type</label>\n    <select name="ccc[conditions]['+s((d=null!=(d=o.idx||(null!=l?l.idx:l))?d:c,typeof d===u?d.call(t,{name:"idx",hash:{},data:i}):d))+'][type]" id="condition_'+s((d=null!=(d=o.idx||(null!=l?l.idx:l))?d:c,typeof d===u?d.call(t,{name:"idx",hash:{},data:i}):d))+'_type" data-idx="'+s((d=null!=(d=o.idx||(null!=l?l.idx:l))?d:c,typeof d===u?d.call(t,{name:"idx",hash:{},data:i}):d))+'" class="condition-type">\n        <option value="simple" selected>Comparison</option>\n        <option value="period">Period</option>\n        <option value="null">Is Null</option>\n    </select>\n    <button type="button" class="btn btn-danger condition-remove">Remove</button>\n</div>'},useData:!0})}();

// period.handlebars
!function(){var l=Handlebars.template,n=Handlebars.templates=Handlebars.templates||{};n.period=l({compiler:[7,">= 4.0.0"],main:function(l,n,i,a,o){var d,e,t=null!=n?n:{},c=i.helperMissing,s="function",u=l.escapeExpression,p=l.lambda;return'<div class="form-group col-md-3 col-xs-12">\n    <label for="condition_'+u((e=null!=(e=i.idx||(null!=n?n.idx:n))?e:c,typeof e===s?e.call(t,{name:"idx",hash:{},data:o}):e))+'_min">Lower limit</label>\n    <input class="form-control" id="condition_'+u((e=null!=(e=i.idx||(null!=n?n.idx:n))?e:c,typeof e===s?e.call(t,{name:"idx",hash:{},data:o}):e))+'_min" name="ccc[conditions]['+u((e=null!=(e=i.idx||(null!=n?n.idx:n))?e:c,typeof e===s?e.call(t,{name:"idx",hash:{},data:o}):e))+'][min]" value="'+u(p(null!=(d=null!=n?n.condition:n)?d.min:d,n))+'">\n</div>\n\n<div class="form-group col-md-3 col-xs-12">\n    <label for="condition_'+u((e=null!=(e=i.idx||(null!=n?n.idx:n))?e:c,typeof e===s?e.call(t,{name:"idx",hash:{},data:o}):e))+'_max">Upper limit</label>\n    <input class="form-control" id="condition_'+u((e=null!=(e=i.idx||(null!=n?n.idx:n))?e:c,typeof e===s?e.call(t,{name:"idx",hash:{},data:o}):e))+'_max" name="ccc[conditions]['+u((e=null!=(e=i.idx||(null!=n?n.idx:n))?e:c,typeof e===s?e.call(t,{name:"idx",hash:{},data:o}):e))+'][max]" value="'+u(p(null!=(d=null!=n?n.condition:n)?d.max:d,n))+'">\n</div>\n\n<div class="form-group col-md-3 col-xs-12">\n    <label for="condition_'+u((e=null!=(e=i.idx||(null!=n?n.idx:n))?e:c,typeof e===s?e.call(t,{name:"idx",hash:{},data:o}):e))+'_color">Color</label>\n\n    <div class="input-group color-picker colorpicker-element">\n        <span class="input-group-addon"><i></i></span>\n        <input type="text" id="condition_'+u((e=null!=(e=i.idx||(null!=n?n.idx:n))?e:c,typeof e===s?e.call(t,{name:"idx",hash:{},data:o}):e))+'_color" name="ccc[conditions]['+u((e=null!=(e=i.idx||(null!=n?n.idx:n))?e:c,typeof e===s?e.call(t,{name:"idx",hash:{},data:o}):e))+'][color]" required="required" class="form-control" value="'+u(p(null!=(d=null!=n?n.condition:n)?d.color:d,n))+'">\n    </div>\n</div>\n\n<div class="form-group col-md-3 col-xs-12">\n    <label for="condition_'+u((e=null!=(e=i.idx||(null!=n?n.idx:n))?e:c,typeof e===s?e.call(t,{name:"idx",hash:{},data:o}):e))+'_type">Type</label>\n    <select name="ccc[conditions]['+u((e=null!=(e=i.idx||(null!=n?n.idx:n))?e:c,typeof e===s?e.call(t,{name:"idx",hash:{},data:o}):e))+'][type]" id="condition_'+u((e=null!=(e=i.idx||(null!=n?n.idx:n))?e:c,typeof e===s?e.call(t,{name:"idx",hash:{},data:o}):e))+'_type" data-idx="'+u((e=null!=(e=i.idx||(null!=n?n.idx:n))?e:c,typeof e===s?e.call(t,{name:"idx",hash:{},data:o}):e))+'" class="condition-type">\n        <option value="simple">Comparison</option>\n        <option value="period" selected>Period</option>\n        <option value="null">Is Null</option>\n    </select>\n    <button type="button" class="btn btn-danger condition-remove">Remove</button>\n</div>'},useData:!0})}();

// null.handlebars
!function(){var l=Handlebars.template,n=Handlebars.templates=Handlebars.templates||{};n["null"]=l({compiler:[7,">= 4.0.0"],main:function(l,n,o,a,i){var e,t,d=null!=n?n:{},c=o.helperMissing,s="function",p=l.escapeExpression;return'<div class="form-group col-md-6 col-xs-12">\n    <label for="condition_'+p((t=null!=(t=o.idx||(null!=n?n.idx:n))?t:c,typeof t===s?t.call(d,{name:"idx",hash:{},data:i}):t))+'_color">Color</label>\n\n    <div class="input-group color-picker colorpicker-element">\n        <span class="input-group-addon"><i></i></span>\n        <input type="text" id="condition_'+p((t=null!=(t=o.idx||(null!=n?n.idx:n))?t:c,typeof t===s?t.call(d,{name:"idx",hash:{},data:i}):t))+'_color" name="ccc[conditions]['+p((t=null!=(t=o.idx||(null!=n?n.idx:n))?t:c,typeof t===s?t.call(d,{name:"idx",hash:{},data:i}):t))+'][color]" required="required" class="form-control" value="'+p(l.lambda(null!=(e=null!=n?n.condition:n)?e.color:e,n))+'">\n    </div>\n</div>\n\n<div class="form-group col-md-6 col-xs-12">\n    <label for="condition_'+p((t=null!=(t=o.idx||(null!=n?n.idx:n))?t:c,typeof t===s?t.call(d,{name:"idx",hash:{},data:i}):t))+'_type">Type</label>\n    <select name="ccc[conditions]['+p((t=null!=(t=o.idx||(null!=n?n.idx:n))?t:c,typeof t===s?t.call(d,{name:"idx",hash:{},data:i}):t))+'][type]" id="condition_'+p((t=null!=(t=o.idx||(null!=n?n.idx:n))?t:c,typeof t===s?t.call(d,{name:"idx",hash:{},data:i}):t))+'_type" data-idx="'+p((t=null!=(t=o.idx||(null!=n?n.idx:n))?t:c,typeof t===s?t.call(d,{name:"idx",hash:{},data:i}):t))+'" class="condition-type">\n        <option value="simple">Comparison</option>\n        <option value="period">Period</option>\n        <option value="null" selected>Is Null</option>\n    </select>\n    <button type="button" class="btn btn-danger condition-remove">Remove</button>\n</div>'},useData:!0})}();
