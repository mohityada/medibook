package com.medibook.backend.controller;

import com.medibook.backend.model.Conversation;
import com.medibook.backend.model.Message;
import com.medibook.backend.security.services.UserDetailsImpl;
import com.medibook.backend.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/messages")
public class MessageController {

    @Autowired
    private MessageService messageService;

    @GetMapping("/conversations")
    public List<Conversation> getConversations(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return messageService.getUserConversations(userDetails.getId());
    }

    @PostMapping("/conversations")
    public Conversation startConversation(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody Map<String, Long> body) {
        Long doctorId = body.get("doctorId");
        return messageService.getOrCreateConversation(userDetails.getId(), doctorId);
    }

    @GetMapping("/conversations/{conversationId}")
    public List<Message> getMessages(
            @PathVariable Long conversationId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return messageService.getConversationMessages(conversationId, userDetails.getId());
    }

    @PostMapping("/conversations/{conversationId}")
    public Message sendMessage(
            @PathVariable Long conversationId,
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody Map<String, String> body) {
        String content = body.get("content");
        return messageService.sendMessage(conversationId, userDetails.getId(), content);
    }

    @PutMapping("/conversations/{conversationId}/read")
    public ResponseEntity<Map<String, String>> markAsRead(
            @PathVariable Long conversationId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        messageService.markConversationAsRead(conversationId, userDetails.getId());
        return ResponseEntity.ok(Map.of("message", "Conversation marked as read"));
    }

    @GetMapping("/unread-count")
    public Map<String, Long> getUnreadCount(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return Map.of("count", messageService.getUnreadCount(userDetails.getId()));
    }
}
