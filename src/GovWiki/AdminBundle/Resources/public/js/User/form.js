$(function() {
    var selectRoles = $('.role-select')[0];
    var selectEnvs = $('.environment-select')[0];
    var optionsList = selectRoles.options;

    // Hide Environments selection if ROLE_MANAGER is not selected
    for (var i = 0; i < optionsList.length; i++) {
        var option = optionsList[i];
        if ('ROLE_ADMIN' == option.value && option.selected) {
            console.log(option.value);
            $(selectEnvs.parentNode).hide();
        }
    }

    // Show/Hide Environments selection on ROLE_MANAGER is selected/not selected
    $(selectRoles).on('change', function () {
        for (var i = 0; i < optionsList.length; i++) {
            var option = optionsList[i];
            if ('ROLE_ADMIN' == option.value) {
                console.log(option.value);
                if (!option.selected) {
                    $(selectEnvs.parentNode).show();
                    break;
                } else {
                    $(selectEnvs.parentNode).hide();
                    break;
                }
            }
        }
    });
});