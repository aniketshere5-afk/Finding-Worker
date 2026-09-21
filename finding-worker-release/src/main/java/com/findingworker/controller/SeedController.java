package com.findingworker.controller;

import com.findingworker.entity.Category;
import com.findingworker.entity.Review;
import com.findingworker.entity.User;
import com.findingworker.entity.WorkerProfile;
import com.findingworker.enums.Role;
import com.findingworker.repository.CategoryRepo;
import com.findingworker.repository.ReviewRepo;
import com.findingworker.repository.UserRepo;
import com.findingworker.repository.WorkerProfileRepo;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.*;

/**
 * One-time synthetic data seeder for demos. Guarded by a shared secret env
 * var rather than prior authentication, since it needs to run before any
 * admin account necessarily exists. Safe to call multiple times (skips
 * categories/users that already exist by unique key).
 */
@RestController
@RequestMapping("/internal/seed")
public class SeedController {

    private final CategoryRepo categoryRepo;
    private final UserRepo userRepo;
    private final WorkerProfileRepo workerProfileRepo;
    private final ReviewRepo reviewRepo;
    private final String seedSecret;

    public SeedController(CategoryRepo categoryRepo, UserRepo userRepo,
                           WorkerProfileRepo workerProfileRepo, ReviewRepo reviewRepo,
                           @Value("${SEED_SECRET:}") String seedSecret) {
        this.categoryRepo = categoryRepo;
        this.userRepo = userRepo;
        this.workerProfileRepo = workerProfileRepo;
        this.reviewRepo = reviewRepo;
        this.seedSecret = seedSecret;
    }

    @PostMapping("/demo-workers")
    public Map<String, Object> seed(@RequestParam String secret) {
        if (seedSecret.isBlank() || !seedSecret.equals(secret)) {
            throw new SecurityException("Forbidden");
        }

        String[] categoryNames = {
                "Electrician", "Plumber", "Carpenter", "Painter", "Mechanic", "AC Repair", "Cleaning", "Appliance Repair"
        };
        Map<String, Category> categories = new LinkedHashMap<>();
        for (String name : categoryNames) {
            Category existing = categoryRepo.findByNameIgnoreCase(name);
            if (existing == null) {
                Category c = new Category();
                c.setName(name);
                existing = categoryRepo.save(c);
            }
            categories.put(name, existing);
        }

        Object[][] workers = {
                {"Rajesh Kumar", "rajesh.kumar.demo@example.com", "9810000001", "Bhopal", "Madhya Pradesh", "462001", 8, "450.00", "Experienced electrician for home wiring, repairs, fans, switches and installations.", "Electrician", true, true, 4.8},
                {"Amit Sharma", "amit.sharma.demo@example.com", "9810000002", "Bhopal", "Madhya Pradesh", "462016", 6, "400.00", "Reliable plumbing professional for leaks, fittings, pipelines and bathroom repairs.", "Plumber", true, true, 4.6},
                {"Imran Khan", "imran.khan.demo@example.com", "9810000003", "Bhopal", "Madhya Pradesh", "462003", 10, "550.00", "Skilled carpenter specialising in furniture repair, doors, cabinets and custom work.", "Carpenter", true, true, 4.9},
                {"Vikram Singh", "vikram.singh.demo@example.com", "9810000004", "Indore", "Madhya Pradesh", "452001", 7, "500.00", "Professional painter for interiors, exteriors, texture and finishing work.", "Painter", false, true, 4.5},
                {"Suresh Patel", "suresh.patel.demo@example.com", "9810000005", "Bhopal", "Madhya Pradesh", "462022", 9, "600.00", "Two-wheeler and car mechanic for servicing, diagnostics and repairs.", "Mechanic", true, true, 4.7},
                {"Deepak Verma", "deepak.verma.demo@example.com", "9810000006", "Bhopal", "Madhya Pradesh", "462026", 5, "500.00", "AC installation, servicing, gas charging and troubleshooting.", "AC Repair", true, true, 4.4},
                {"Neha Joshi", "neha.joshi.demo@example.com", "9810000007", "Indore", "Madhya Pradesh", "452010", 4, "350.00", "Deep cleaning, sofa shampoo and full home sanitisation services.", "Cleaning", true, false, 4.2},
                {"Ramesh Yadav", "ramesh.yadav.demo@example.com", "9810000008", "Bhopal", "Madhya Pradesh", "462011", 12, "650.00", "Refrigerator, washing machine and microwave repair specialist.", "Appliance Repair", true, true, 4.9},
                {"Manoj Tiwari", "manoj.tiwari.demo@example.com", "9810000009", "Indore", "Madhya Pradesh", "452007", 3, "300.00", "Newly certified electrician, available for small residential jobs.", "Electrician", true, false, 3.9},
                {"Sanjay Gupta", "sanjay.gupta.demo@example.com", "9810000010", "Bhopal", "Madhya Pradesh", "462036", 15, "700.00", "Master plumber with 15 years experience in commercial and residential plumbing.", "Plumber", true, true, 5.0}
        };

        List<Long> createdWorkerIds = new ArrayList<>();
        for (Object[] w : workers) {
            String email = (String) w[1];
            if (userRepo.existsByEmail(email)) continue;

            User user = new User();
            user.setName((String) w[0]);
            user.setEmail(email);
            user.setPhone((String) w[2]);
            user.setRole(Role.WORKER);
            user.setPassword(null);
            user = userRepo.save(user);

            WorkerProfile wp = new WorkerProfile();
            wp.setUser(user);
            wp.setCity((String) w[3]);
            wp.setState((String) w[4]);
            wp.setPincode((String) w[5]);
            wp.setExperience((Integer) w[6]);
            wp.setHourlyRate(new BigDecimal((String) w[7]));
            wp.setDescription((String) w[8]);
            wp.setCategories(new HashSet<>(Set.of(categories.get((String) w[9]))));
            wp.setAvailableForWork((Boolean) w[10]);
            wp.setVerified((Boolean) w[11]);
            wp.setTrustScore((Double) w[12]);
            wp = workerProfileRepo.save(wp);
            createdWorkerIds.add(wp.getId());
        }

        String[][] demoReviewers = {
                {"Priya Menon", "priya.menon.demo@example.com", "9820000001"},
                {"Rahul Nair", "rahul.nair.demo@example.com", "9820000002"},
                {"Sneha Iyer", "sneha.iyer.demo@example.com", "9820000003"}
        };
        List<User> reviewers = new ArrayList<>();
        for (String[] r : demoReviewers) {
            User existing = userRepo.findByEmail(r[1]).orElse(null);
            if (existing == null) {
                User u = new User();
                u.setName(r[0]);
                u.setEmail(r[1]);
                u.setPhone(r[2]);
                u.setRole(Role.CUSTOMER);
                u.setPassword(null);
                existing = userRepo.save(u);
            }
            reviewers.add(existing);
        }

        String[] comments = {
                "Very professional and arrived on time.",
                "Good work and reasonable pricing.",
                "Excellent finishing and communication.",
                "Would definitely book again, highly recommended.",
                "Fixed the issue quickly, very knowledgeable."
        };
        int reviewsCreated = 0;
        List<WorkerProfile> allWorkers = workerProfileRepo.findAll();
        Random rnd = new Random(42);
        for (WorkerProfile wp : allWorkers) {
            if (!reviewRepo.findAll().stream().anyMatch(rv -> rv.getWorker() != null && rv.getWorker().getId().equals(wp.getId()))) {
                int numReviews = 1 + rnd.nextInt(3);
                for (int i = 0; i < numReviews; i++) {
                    Review rv = new Review();
                    rv.setWorker(wp);
                    rv.setCustomer(reviewers.get(rnd.nextInt(reviewers.size())));
                    rv.setRating(3 + rnd.nextInt(3));
                    rv.setComment(comments[rnd.nextInt(comments.length)]);
                    reviewRepo.save(rv);
                    reviewsCreated++;
                }
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("categoriesEnsured", categories.size());
        result.put("workersCreated", createdWorkerIds.size());
        result.put("reviewsCreated", reviewsCreated);
        return result;
    }
}
