package com.app.gestion.repository;

import com.app.gestion.model.Action;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ActionRepository extends JpaRepository<Action, Integer> {
    Optional<Action> findByActionName(String actionName);
}
