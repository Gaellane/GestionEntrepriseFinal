package com.app.gestion.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.app.gestion.dto.stock.DepotDTO;
import com.app.gestion.model.Depot;
import com.app.gestion.repository.DepotRepository;

@Service
public class DepotService {

    private final DepotRepository depotRepository;

    public DepotService(DepotRepository depotRepository) {
        this.depotRepository = depotRepository;
    }

    public List<DepotDTO> getAll() {
        List<Depot> depots = depotRepository.findAll();
        return depots.stream().map(d -> DepotDTO.builder()
                .id(d.getId())
                .depotName(d.getDepotName())
                .build())
            .collect(Collectors.toList());
    }
}
