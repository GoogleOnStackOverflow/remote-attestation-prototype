/* The LibVMI Library is an introspection library that simplifies access to 
 * memory in a target virtual machine or in a file containing a dump of 
 * a system's physical memory.  LibVMI is based on the XenAccess Library.
 *
 * Copyright 2011 Sandia Corporation. Under the terms of Contract
 * DE-AC04-94AL85000 with Sandia Corporation, the U.S. Government
 * retains certain rights in this software.
 *
 * Author: Bryan D. Payne (bdpayne@acm.org)
 *
 * This file is part of LibVMI.
 *
 * LibVMI is free software: you can redistribute it and/or modify it under
 * the terms of the GNU Lesser General Public License as published by the
 * Free Software Foundation, either version 3 of the License, or (at your
 * option) any later version.
 *
 * LibVMI is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Lesser General Public
 * License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with LibVMI.  If not, see <http://www.gnu.org/licenses/>.
 */

 /*

 gcc -DHAVE_CONFIG_H -I. -I..    -I.. -I/usr/include/glib-2.0 -I/usr/lib/x86_64-linux-gnu/glib-2.0/include -Wall -Wextra  -g -O2 -MT process-list.o -MD -MP -MF $depbase.Tpo -c -o process-list.o process-list.c

 */

#include <stdlib.h>
#include <string.h>
#include <errno.h>
#include <sys/mman.h>
#include <stdio.h>
#include <inttypes.h>

#include <libvmi/libvmi.h>
#include <unistd.h>

int main (int argc, char **argv)
{
    vmi_instance_t vmi;
    addr_t list_head = 0, next_list_entry = 0;
    addr_t current_process = 0;
    char *procname = NULL;
    unsigned long tasks_offset = 0, pid_offset = 0, name_offset = 0;
    status_t status;

    /* this is the VM or file that we are looking at */
    if (argc != 2) {
        return 1;
    }

    char *name = argv[1];

    /* initialize the libvmi library */
    if (vmi_init(&vmi, VMI_AUTO | VMI_INIT_COMPLETE, name) == VMI_FAILURE) {
        printf("VM_NOT_FOUND\n");
        return 1;
    }

    /* init the offset values */
    // Get these data from the config file of the VM (/etc/libvmi.conf)
    // See: https://libvmi.wordpress.com/2015/01/23/libvmi-xen-setup/
    // Fill the config file with the output of the findoffset module
    if (VMI_OS_LINUX == vmi_get_ostype(vmi)) {
        tasks_offset = vmi_get_offset(vmi, "linux_tasks");
        name_offset = vmi_get_offset(vmi, "linux_name");
        pid_offset = vmi_get_offset(vmi, "linux_pid");
    }

    if (0 == tasks_offset || 0 == name_offset || 0 == pid_offset) {
        printf("VM_NOT_FOUND\n");
        goto error_exit;
    }

    /* pause the vm for consistent memory access */
    if (vmi_pause_vm(vmi) != VMI_SUCCESS) {
        printf("VM_NOT_FOUND\n");
        goto error_exit;
    }

    /* demonstrate name and id accessors */
    if (VMI_FILE == vmi_get_access_mode(vmi)) {
        printf("VM_NOT_FOUND\n");
        goto error_exit;
    }

    /* get the head of the list */
    list_head = vmi_translate_ksym2v(vmi, "init_task") + tasks_offset;
    next_list_entry = list_head;

    /* walk the task list */
    do {
        current_process = next_list_entry - tasks_offset;

        procname = vmi_read_str_va(vmi, current_process + name_offset, 0);

        if (!procname) {
            printf("VM_NOT_FOUND\n");
            goto error_exit;
        }

        printf("%s\n", procname);
        /* follow the next pointer */
        free(procname);
        procname = NULL;

        status = vmi_read_addr_va(vmi, next_list_entry, 0, &next_list_entry);
        if (status == VMI_FAILURE) {
            printf("VM_NOT_FOUND\n");
            goto error_exit;
        }
    } while(next_list_entry != list_head);

error_exit:
    /* resume the vm */
    vmi_resume_vm(vmi);

    /* cleanup any memory associated with the LibVMI instance */
    vmi_destroy(vmi);

    return 0;
}