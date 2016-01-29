#!/usr/bin/env bash

#
# Setup permission on upload directory.
#

APACHEUSER=`ps aux | grep -E '[a]pache|[h]ttpd' | grep -v root | head -1 | cut -d\  -f1`

if [ `command -v setfacl 2>&1` ] ; then
    setfacl -R -m u:$APACHEUSER:rwX -m u:`whoami`:rwX web/img web/img/upload
    setfacl -dR -m u:$APACHEUSER:rwX -m u:`whoami`:rwX web/img web/img/upload
else
    chmod +a "$APACHEUSER allow delete,write,append,file_inherit,directory_inherit" web/img web/img/upload
    chmod +a "`whoami` allow delete,write,append,file_inherit,directory_inherit" web/img web/img/upload
fi