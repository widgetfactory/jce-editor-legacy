tinyMCE.addI18n('en.dlg',{
// JCE specific
modified: 'Modified',
file: 'File',
folder: 'Folder',
files: 'files',
folders: 'folders',
comments: 'Comments',
size: 'Size',
preview: 'Preview',
duration: 'Duration',
dimensions: 'Dimensions',
contents: 'Contents',
unwritable: 'Unwritable',
bad_name: 'Bad file or folder name',
message_tree: 'Building tree list...',
message_load: 'Loading...',
message_properties: 'Retrieving properties...',
current_dir: 'Current directory is: ',
help: 'Help',
name: 'Name',
'options': 'Options',
'confirm': 'Confirm',
yes: 'Yes',
no: 'No',
'alert': 'Alert',
folder_new: 'New Folder',
rename: 'Rename',
'delete': 'Delete',
save : 'Save',
delete_item_alert: 'Delete Selected Item(s)?',
rename_folder: 'Rename Folder',
rename_file: 'Rename File',
rename_item_alert: 'Renaming files/folders will break existing links. Continue?',
rename_item_name_new: 'Please specify a new name for the file/folder',
file_select: 'Click on a file name to insert, click to the right of the name to view its properties. CTRL+Click selects multiple files.',
notwritable: 'Unwritable',
notwritable_desc: 'Unwritable::Folder or file is not writable and cannot be renamed, moved or deleted.',
bad_name: 'Invalid file or folder name',
bad_name_desc: 'Invalid file or folder name::Folder/file name can only contain the characters a-zA-Z0-9_-.~',
select_value: 'Add Value',
select_label: 'Add Value',
size_bytes : 'Bytes',
size_kb : 'KB',
size_mb : 'MB',
date_format : '',
media_not_supported:'Media type not supported by this browser',
one_of_many : '%o of %m',
element_selection : 'Element Selection',
/**
 * Upload
 */
uploading: 'Uploading...',
upload: 'Upload',
queue: 'Queue',
upload_drop: 'Drop files here',
cancel: 'Cancel',
ok: 'OK',
browse: 'Browse',
file_extension_error : 'File type not supported',
file_size_error : 'File size exceeds maximum allowed size',
file_invalid_error : 'Invalid File type',
upload_queue:'Upload Queue',
close:'Close',
/**
 * Upload Error Codes
 */
'-600' : '%f (%s) exceeds the maximum allowed size of %m',
'-601' : 'File: %s',
'-800' : 'File: %s'
});

// Core JCE Plugins

// Aritcle - Pagebreak and Readmore
tinyMCE.addI18n('en.pagebreak_dlg',{
desc:"Insert / Edit Pagebreak",
title:"Page Title",
alias:"Table of Contents Alias"
});

// Image Manager
tinyMCE.addI18n('en.imgmanager_dlg',{
missing_alt: "Are you sure you want to continue without including Alternate Text for the image? Without it the image may not be accessible to some users with disabilities, or to those using a text browser, or browsing the Web with images turned off.",
no_src: 'A URL is required. Please select an image or enter a URL'
});

// Link
tinyMCE.addI18n('en.link_dlg',{
is_email:"The URL you entered seems to be an email address, do you want to add the required mailto: prefix?",
is_external:"The URL you entered seems to be an external link, do you want to add the required http:// prefix?",
no_href:"A URL is required. Please select a link or enter a URL",
no_text:"Please enter some text for the link",
email:"Create E-mail Address",
to:"To",
cc:"CC",
bcc:"BCC",
subject:"Subject",
invalid_email:" is not a valid e-mail address!"
});