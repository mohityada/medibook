package com.medibook.backend.controller;

import com.medibook.backend.model.Notification;
import com.medibook.backend.payload.response.MessageResponse;
import com.medibook.backend.security.services.UserDetailsImpl;
import com.medibook.backend.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping
    public List<Notification> getNotifications(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return notificationService.getUserNotifications(userDetails.getId());
    }

    @GetMapping("/unread")
    public List<Notification> getUnreadNotifications(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return notificationService.getUnreadNotifications(userDetails.getId());
    }

    @GetMapping("/unread-count")
    public Map<String, Long> getUnreadCount(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return Map.of("count", notificationService.getUnreadCount(userDetails.getId()));
    }

    @PutMapping("/{id}/read")
    public Notification markAsRead(@PathVariable Long id,
                                    @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return notificationService.markAsRead(id, userDetails.getId());
    }

    @PutMapping("/read-all")
    public ResponseEntity<MessageResponse> markAllAsRead(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        notificationService.markAllAsRead(userDetails.getId());
        return ResponseEntity.ok(new MessageResponse("All notifications marked as read"));
    }
}
