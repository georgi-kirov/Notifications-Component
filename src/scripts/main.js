var notifications = (function () {
    let jsonData = {};
    var notificationsIds = [];

    const path = "./src/json/notifications.json";

    // Get JSON data
    $.getJSON(path, function (json) {
        jsonData = json;
        start(json);
    });

    setInterval(checkForUpdates,2000);
    function checkForUpdates() {
        $.getJSON(path, function (json) {
            // new data for one notification
            let isChanged = false;
            for (let index = 0; index < jsonData.length; index++) {
                    
                if(json[0].id === jsonData[index].id) {
                    isChanged = isEquivalent(json[0], jsonData[index]);
                    jsonData.splice(index, 1, json[0]);
                }
            }
            if (json.length === 1 && isChanged) {
                console.log('heree')
                let notId = json[0].id;
                let notificationInList = $('.notification-'+notId);
                let indexOfNotificationInList = $( ".notification" ).index(notificationInList);
                let updatedNotification = createNotification(json[0]);
                
                // if is the first notification in the list
                if (indexOfNotificationInList === 0) {
                    $('.notifications-list .notification-'+notId).remove();
                    $('.notifications-list').prepend(updatedNotification);
                } else {
                    $('.notifications-list .notification-'+notId).remove();
                    $('.notifications-list .notification:eq('+--indexOfNotificationInList+')').after(updatedNotification);
                }
                
            } else if (jsonData.length !== json.length && json.length > 1) {
                // check if notification is added or removed
                // if new notification is added
                if (jsonData.length < json.length)  {
                    for (const notification in json) {

                        if (json.hasOwnProperty(notification) && notification !== 'length') {
                            
                           if (notificationsIds.indexOf(json[notification].id) == -1 ) {
                                notificationsIds.push(json[notification].id);
                                addNotification(json[notification]);
                           }
                        }
                    }
                } else {
                    // if notification is removed
                    let newJsonIds = [];
                    for (const notification in json) {

                        if (json.hasOwnProperty(notification) && notification !== 'length') {
                            newJsonIds.push(json[notification].id);
                        }
                    }

                    for (let index = 0; index < notificationsIds.length; index++) {

                        if (newJsonIds.indexOf(notificationsIds[index]) == -1) {
                            removeNotification(notificationsIds[index]);
                        }
                    }
                    notificationsIds = newJsonIds;
                }
                jsonData = json;
                $('.notifications-icon .notification-count').text(countNotifications(json));
                // notificationExpire(json);
            }
        });
    }

    // All Starts from here
    function start(notifications) {
        
        $('.notifications-icon .notification-count').text(countNotifications(notifications));
        $('.notifications-list').html(createNotificationsList(notifications));
        // test image - the url in data img return status 404 and redirect
        $(".notification-image img").attr("src","./src/assets/images/promotion.png");
        // notificationExpire(notifications);
    }

    function addNotification(notification) {
        let newNotification = createNotification(notification);
        $(newNotification).hide().appendTo('.notifications-list').fadeIn(1000);
    }

    function removeNotification(notificationId) {
        $('.notifications-list .notification.notification-'+notificationId+'').fadeOut("slow", function() {
            $('.notifications-list .notification.notification-'+notificationId+'').remove();
        });
    }

    // Create single notification
    function createNotification(notification) {
        let notificationHTML = "",
            additionalClass = "";

        notificationHTML += '<div class="notification notification-'+notification.id+'">';
        // photo
        notificationHTML += '<div class="notification-info">'; 
        if (notification['image']) {
            notificationHTML += '<div class="notification-image"><img src='+notification.image+'/></div>';
            additionalClass = 'image-text';
        }
       
        // title
        notificationHTML += '<div class="notification-text '+additionalClass+'">';
        notificationHTML += '<h3>'+notification.title+'</h3>';

        // text 
        if (notification['text']) {
            notificationHTML += '<p>'+notification.text+'</p>';
        }

        // requirement
        if (notification['requirement']) {
            notificationHTML += '<p>requirement: '+notification.requirement+'</p>';
        }

        if (notification['link']) {
            let url = notification.link;
            let relativeUrl = url.replace(/(^\w+:|^)\/\//, '');
            notificationHTML += 'visit: <a href="'+notification.link+'">'+relativeUrl+'</a>';
        }

        notificationHTML += '</div></div>';
        notificationHTML += '<div  class="notification-expire">';
        if(notification['expires']) {
            notificationHTML += '<div>expire after '+notification.expires+'</div>';
        }
        notificationHTML += '</div></div>';

        return notificationHTML;
    }

    function createNotificationsList(notifications) {
        let notificationsListHTML = '';

        for (const notification in notifications) {
            if (notifications.hasOwnProperty(notification) && notification !== "length") {
                notificationsListHTML += createNotification(notifications[notification]);
            }
        }

        return notificationsListHTML;
    }
    

    // count all notifications without this one with type 'bonus'
    function countNotifications(notifications) {
        let count = 0;
        for (const notification in notifications) {

            if (notifications.hasOwnProperty(notification) && notification != 'length') {

                notificationsIds.push(notifications[notification].id);

                if(notifications[notification]['type'] === 'bonus') continue;

                count++;
            }
        }
        return count;
    }
    
    // remove notification after she expire
    function notificationExpire (notifications) {
        for (const notification in notifications) {

            if (notifications.hasOwnProperty(notification) && notification != 'length') {

               if(notifications[notification]['expires']) { 
                    setTimeout(function(){
                            $('.notification-'+notifications[notification].id).fadeOut(1000, function() {
                                $('.notification-'+notifications[notification].id).remove();
                                $('.notifications-icon .notification-count').text($('.notifications-list')[0].childElementCount);
                            });
                            
                      }, notifications[notification].expires);
               }
            }
        }
    }

    // check if objects prop value has change
    function isEquivalent(object1, object2) {
        // Create arrays of property names
        let object1Props = Object.getOwnPropertyNames(object1);

        for (let i = 0; i < object1Props.length; i++) {
            let propName = object1Props[i];
            // If values of same property are not equal,
            // objects are not equivalent
            if (object1[propName] !== object2[propName]) {
                return true;
            }
        }
    
        // If we made it this far, objects
        // are considered equivalent
        return false;
    }

    var viewScope = {
        showHideNotifications: function() {
            if ($('.notifications').hasClass('hidden')) {
                $('.notifications').slideDown("slow");
                $('.notifications').removeClass('hidden');
            } else {
                $('.notifications').slideUp("slow");
                $('.notifications').addClass('hidden');
            }
        }
    }

    return {
        showHideNotifications: viewScope.showHideNotifications,
    }
}());
